const https = require('https');

const THREADS_API_VERSION = 'v1.0';
const THREADS_API_HOST = 'graph.threads.net';

function graphRequest(method, endpoint, params) {
  return new Promise((resolve, reject) => {
    const url = new URL(`https://${THREADS_API_HOST}/${THREADS_API_VERSION}/${endpoint}`);
    const body = new URLSearchParams(params).toString();

    const options = {
      method,
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
    };

    if (method === 'GET') url.search = body;

    const req = https.request(url, options, res => {
      let data = '';
      res.on('data', chunk => (data += chunk));
      res.on('end', () => {
        const parsed = JSON.parse(data);
        if (res.statusCode >= 400) {
          reject(new Error(`Threads API error (${res.statusCode}): ${JSON.stringify(parsed)}`));
        } else {
          resolve(parsed);
        }
      });
    });

    req.on('error', reject);
    if (method !== 'GET') req.write(body);
    req.end();
  });
}

// A criação de um post no Threads (passo 1) é rápida e, segundo a documentação
// da Meta, normalmente já está pronta para publicar em poucos segundos
// (diferente do Instagram, que processa mídia de forma assíncrona e pode
// demorar). Por isso não há uma etapa de polling de status aqui: o fluxo é
// só criar (POST /threads) e publicar (POST /threads_publish) em sequência.

module.exports = { graphRequest };
