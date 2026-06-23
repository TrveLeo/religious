const https = require('https');

const GRAPH_API_VERSION = 'v21.0';

function graphRequest(method, endpoint, params) {
  return new Promise((resolve, reject) => {
    const url = new URL(`https://graph.instagram.com/${GRAPH_API_VERSION}/${endpoint}`);
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
          reject(new Error(`Graph API error (${res.statusCode}): ${JSON.stringify(parsed)}`));
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

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function waitUntilReady(mediaId, accessToken, attempts = 15, intervalMs = 4000) {
  for (let i = 0; i < attempts; i++) {
    const status = await graphRequest('GET', mediaId, {
      fields: 'status_code',
      access_token: accessToken
    });
    if (status.status_code === 'FINISHED') return;
    if (status.status_code === 'ERROR') {
      throw new Error(`Processamento da mídia falhou: ${JSON.stringify(status)}`);
    }
    await sleep(intervalMs);
  }
  throw new Error('Tempo esgotado esperando a mídia ficar pronta.');
}

module.exports = { graphRequest, sleep, waitUntilReady };
