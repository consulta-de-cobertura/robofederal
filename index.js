const puppeteer = require('puppeteer');
const axios = require('axios');
const { createClient } = require('@supabase/supabase-js');

// Configurações do Supabase
const supabaseUrl = 'https://wpxodnqmiiexbfleifsb.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndweG9kbnFtaWlleGJmbGVpZnNiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDcyNjcxNzIsImV4cCI6MjA2Mjg0MzE3Mn0.WZFjOC0DX5xUWzI5k150mDvu02h9RnULAwZzFFOK8OQ';
const supabase = createClient(supabaseUrl, supabaseKey);

// Configurações da Z-API
const instance = '3E10B3ED9B50B0E3F6F5AAEF140028B5';
const token = '4584BFE8D86774FEC9CF4A9D';
const clientToken = 'Fb3e7aacda2a64529afc88e72d27b6164S';

// Função principal
(async () => {
  try {
    const { data: associados } = await supabase.from('usuarios').select('*');

    if (!Array.isArray(associados)) {
      console.error('Erro: o retorno do Supabase não é uma lista de associados.');
      return;
    }

    for (const associado of associados) {
      const { cpf, nome, whatsapp } = associado;

      const browser = await puppeteer.launch({ headless: false });
      const page = await browser.newPage();

      try {
        await page.goto('https://federalassociados.com.br/boletos', { waitUntil: 'networkidle2', timeout: 60000 });
        await page.waitForTimeout(5000);

        const inputSelector = 'input[name="cpf"]';
        await page.waitForSelector(inputSelector);

        for (const digit of cpf) {
          await page.type(inputSelector, digit);
          await page.waitForTimeout(200); // digitação humana
        }

        await page.waitForTimeout(3000);
        const consultarBtn = await page.$x("//button[contains(., 'Consultar')]");
        if (consultarBtn.length > 0) await consultarBtn[0].click();
        else throw new Error("Botão 'Consultar' não encontrado");

        await page.waitForTimeout(10000);

        const pagamentoBtn = await page.$x("//button[contains(., 'Realizar pagamento')]");
        if (pagamentoBtn.length > 0) {
          await pagamentoBtn[0].click();
          await page.waitForTimeout(8000);

          const urlPagamento = page.url();
          await axios.post(`https://api.z-api.io/instances/${instance}/token/${token}/send-text`, {
            phone: whatsapp,
            message: `Olá ${nome}, sua fatura está disponível! Pague aqui: ${urlPagamento}`
          }, {
            headers: {
              'Content-Type': 'application/json',
              'client-token': clientToken
            }
          });

          console.log(`Mensagem enviada com sucesso para ${nome} (${cpf})`);
        } else {
          console.log(`Nenhuma fatura pendente para ${nome} (${cpf})`);
        }

        await browser.close();

      } catch (erroInterno) {
        console.error('Erro durante a execução do robô:', erroInterno.message);
        await browser.close();
      }

      await new Promise(resolve => setTimeout(resolve, 3000)); // Pausa entre cada CPF
    }

  } catch (erroGeral) {
    console.error('Erro geral ao consultar o Supabase:', erroGeral);
  }
})();


