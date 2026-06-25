const TRIGGER_WORDS = ['amem', 'amém', 'amen'];

const REPLIES = [
  'Amém! Que essa palavra continue te fortalecendo hoje. 🙏',
  'Glória a Deus por isso! Volte sempre. 🙏',
  'Amém, irmão(ã)! Fica com Deus. 🙏'
];

function normalize(text) {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '');
}

function pickReply(seed) {
  const index = Math.abs(seed) % REPLIES.length;
  return REPLIES[index];
}

function hashString(str) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash |= 0;
  }
  return hash;
}

async function replyToComment(commentId, message, accessToken) {
  const url = `https://graph.instagram.com/v21.0/${commentId}/replies`;
  const body = new URLSearchParams({ message, access_token: accessToken });

  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: body.toString()
  });

  if (!response.ok) {
    const errorBody = await response.text();
    console.error(`Falha ao responder comentário ${commentId}: ${errorBody}`);
  }
}

async function handleWebhookEvent(payload, env, ctx) {
  const entries = payload.entry || [];

  for (const entry of entries) {
    const changes = entry.changes || [];
    for (const change of changes) {
      if (change.field !== 'comments') continue;

      const value = change.value || {};
      const commentId = value.id;
      const text = value.text || '';

      if (!commentId || !text) continue;

      const normalized = normalize(text);
      const matched = TRIGGER_WORDS.some(word => normalized.includes(word));

      if (matched) {
        const reply = pickReply(hashString(commentId));
        ctx.waitUntil(replyToComment(commentId, reply, env.IG_ACCESS_TOKEN));
      }
    }
  }
}

export { normalize, pickReply, hashString, handleWebhookEvent, TRIGGER_WORDS, REPLIES };

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);

    if (request.method === 'GET') {
      const mode = url.searchParams.get('hub.mode');
      const token = url.searchParams.get('hub.verify_token');
      const challenge = url.searchParams.get('hub.challenge');

      if (mode === 'subscribe' && token === env.VERIFY_TOKEN) {
        return new Response(challenge, { status: 200 });
      }
      return new Response('Verificação falhou', { status: 403 });
    }

    if (request.method === 'POST') {
      let payload;
      try {
        payload = await request.json();
      } catch (err) {
        return new Response('Payload inválido', { status: 400 });
      }

      ctx.waitUntil(handleWebhookEvent(payload, env, ctx));
      return new Response('OK', { status: 200 });
    }

    return new Response('Método não suportado', { status: 405 });
  }
};
