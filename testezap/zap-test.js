const axios = require('axios');

const url = 'https://api.z-api.io/instances/3E10B3ED9B50B0E3F6F5AAEF140028B5/token/4584BFE8D86774FEC9CF4A9D/send-text';

const headers = {
  'Content-Type': 'application/json',
  'client-token': 'Fb3e7aacda2a64529afc88e72d27b6164S' // Token fornecido hoje
};

const data = {
  phone: '5584981321396',
  message: '✅ Teste final com Client-Token correto. Verificando entrega real no WhatsApp.'
};

axios.post(url, data, { headers })
  .then(response => {
    console.log('✅ Mensagem enviada com sucesso!');
    console.log(response.data);
  })
  .catch(error => {
    console.error('❌ Erro ao enviar:', error.response?.data || error.message);
  });
