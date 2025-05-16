const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch({
    headless: false,
    defaultViewport: null,
    args: ['--start-maximized']
  });

  const page = await browser.newPage();

  // Força o navegador a parecer um Google Chrome real
  await page.setUserAgent(
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/113.0.0.0 Safari/537.36'
  );

  // Abre o WhatsApp com o número
  await page.goto('https://api.whatsapp.com/send?phone=5584981321396', { waitUntil: 'networkidle2' });

  // Espera o botão "Iniciar conversa" e clica via XPath
  try {
    await page.waitForXPath("//a[contains(text(), 'Iniciar conversa')]", { timeout: 20000 });
    const [botao] = await page.$x("//a[contains(text(), 'Iniciar conversa')]");
    if (botao) {
      await botao.click();
    } else {
      throw new Error("Botão não encontrado");
    }
  } catch (error) {
    console.log('Erro ao clicar em "Iniciar conversa":', error.message);
    await browser.close();
    return;
  }

  // Aguarda botão "Usar o WhatsApp Web"
  await page.waitForSelector('a[href*="web.whatsapp.com"]', { timeout: 60000 });
  await page.click('a[href*="web.whatsapp.com"]');

  // Aguarda campo de mensagem e envia "Oi"
  await page.waitForSelector('div[title="Mensagem"]', { timeout: 60000 });
  await page.type('div[title="Mensagem"]', 'Oi');
  await page.keyboard.press('Enter');

  console.log('Mensagem enviada com sucesso!');
  await browser.close();
})();
