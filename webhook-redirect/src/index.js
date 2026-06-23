const SITE_URL = 'https://trveleo.github.io/religious/';

// Não existe hoje uma página dedicada ao Pix em docs/ (só o QR Code em
// docs/assets/pix-qrcode.png). Por isso /pix redireciona para a home por
// enquanto; se um dia existir uma página específica, é só trocar PIX_URL.
const PIX_URL = 'https://trveleo.github.io/religious/';

function todayKey() {
  return new Date().toISOString().slice(0, 10);
}

async function incrementCounter(kv, kind) {
  const key = `clicks:${kind}:${todayKey()}`;
  const current = await kv.get(key);
  const count = parseInt(current, 10) || 0;
  await kv.put(key, String(count + 1));
}

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);

    if (request.method !== 'GET') {
      return new Response('Método não suportado', { status: 405 });
    }

    if (url.pathname === '/bio') {
      ctx.waitUntil(incrementCounter(env.CLICKS, 'bio'));
      return Response.redirect(SITE_URL, 302);
    }

    if (url.pathname === '/pix') {
      ctx.waitUntil(incrementCounter(env.CLICKS, 'pix'));
      return Response.redirect(PIX_URL, 302);
    }

    return new Response('Não encontrado', { status: 404 });
  }
};
