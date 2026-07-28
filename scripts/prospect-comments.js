require('dotenv').config();
const https = require('https');
const fs = require('fs');
const path = require('path');
const nodemailer = require('nodemailer');
const { dayOfYear, dateKey } = require('./lib/dates.js');

const IG_ACCESS_TOKEN = process.env.IG_ACCESS_TOKEN;
const IG_USER_ID = process.env.IG_USER_ID;
const EMAIL_USER = process.env.EMAIL_USER;
const EMAIL_PASS = process.env.EMAIL_PASS;
const EMAIL_TO = 'leo.trve@gmail.com';
const OUTPUT_DIR = path.join(__dirname, '..', 'docs', 'output');

// 15 hashtags — roda 2 por dia, cobre semana inteira sem repetir no mesmo dia.
// Limite da API: 30 hashtags únicas por 7 dias por conta.
const HASHTAGS = [
  'devocionaldiario',
  'versiculododia',
  'reflexaobiblica',
  'palavradedeus',
  'palavradodia',
  'devocionalcristao',
  'versiculobiblico',
  'fenuncamorre',
  'deusnocontrole',
  'oracao',
  'cristaos',
  'mensagemdedeus',
  'devocional',
  'fe',
  'biblia'
];

// Templates de comentário por tema detectado na legenda.
// O default (sem keywords) serve como fallback.
const COMMENT_TEMPLATES = [
  {
    keywords: ['ansiedad', 'ansios', 'preocup', 'medo', 'angust'],
    text: 'Que palavra necessária. Ansiedade é muito mais comum entre cristãos do que a gente admite — obrigado por falar disso com tanta honestidade 🙏'
  },
  {
    keywords: ['cansad', 'cansaço', 'força', 'vigor', 'fraco', 'fraqueza', 'esgot'],
    text: 'Isso ministrou aqui. É exatamente nos momentos em que não sobra mais nada que Deus age com mais clareza. Palavra certa na hora certa.'
  },
  {
    keywords: ['solidão', 'sozinho', 'sozinha', 'abandonad', 'esquecid'],
    text: 'Essa palavra chega onde a maioria das pregações não chega. Solidão é um peso que muita gente carrega em silêncio — obrigado por trazer isso à luz 🙏'
  },
  {
    keywords: ['decisão', 'decis', 'caminho', 'direção', 'escolha', 'guia'],
    text: 'Faz muito sentido. Buscar direção antes de decidir, não depois de errar — é uma diferença que muda tudo. Boa reflexão.'
  },
  {
    keywords: ['recomeç', 'novo', 'renovação', 'restaur', 'restauração'],
    text: 'Que esperança real isso traz. Recomeçar não é fingir que nada aconteceu — é exatamente o que você disse aqui. Amém 🙏'
  },
  {
    keywords: ['gratidão', 'grato', 'grata', 'agradecer', 'bênção'],
    text: 'Gratidão é mesmo uma disciplina — e você explicou aqui com uma clareza que raramente se vê. Boa meditação.'
  },
  {
    keywords: ['fé', 'duvidar', 'dúvida', 'incredulidad', 'tremer', 'crise'],
    text: 'Que honestidade. A fé imperfeita que você descreve aqui é muito mais real do que qualquer coisa que ignora a dúvida. Obrigado por isso.'
  },
  {
    keywords: ['salmo', 'salmista', 'davi', 'david'],
    text: 'Os Salmos são únicos nisso: completamente honestos sobre a dor sem perder a confiança. Você capturou bem esse equilíbrio 🙏'
  },
  {
    keywords: ['oração', 'orar', 'ore', 'clamor', 'clama'],
    text: 'Amém. Oração não muda necessariamente a situação — mas muda quem está na situação. Isso aqui é verdade.'
  },
  {
    keywords: ['versículo', 'versículo', 'palavra', 'escrita'],
    text: 'Que versículo poderoso. Tem coisas no texto bíblico que a gente passa anos sem perceber a profundidade — obrigado por aprofundar assim 🙏'
  },
  {
    keywords: [],
    text: 'Que palavra. Isso chegou de forma muito específica hoje — é daqueles posts que a gente para pra reler. Abençoado 🙏'
  }
];

function pickCommentTemplate(caption) {
  if (!caption) return COMMENT_TEMPLATES[COMMENT_TEMPLATES.length - 1].text;
  const lower = caption.toLowerCase();
  for (const tmpl of COMMENT_TEMPLATES) {
    if (tmpl.keywords.length === 0) continue;
    if (tmpl.keywords.some(k => lower.includes(k))) return tmpl.text;
  }
  return COMMENT_TEMPLATES[COMMENT_TEMPLATES.length - 1].text;
}

function facebookGet(endpoint, params) {
  return new Promise((resolve, reject) => {
    const url = new URL(`https://graph.facebook.com/v21.0/${endpoint}`);
    url.search = new URLSearchParams(params).toString();
    https.get(url, res => {
      let data = '';
      res.on('data', c => (data += c));
      res.on('end', () => {
        const parsed = JSON.parse(data);
        if (res.statusCode >= 400) reject(new Error(`FB API error: ${JSON.stringify(parsed)}`));
        else resolve(parsed);
      });
    }).on('error', reject);
  });
}

async function getHashtagId(hashtag) {
  const res = await facebookGet('ig-hashtag-search', {
    user_id: IG_USER_ID,
    q: hashtag,
    access_token: IG_ACCESS_TOKEN
  });
  if (!res.data || !res.data[0]) throw new Error(`Hashtag não encontrada: #${hashtag}`);
  return res.data[0].id;
}

async function getRecentMedia(hashtagId) {
  const res = await facebookGet(`${hashtagId}/recent_media`, {
    user_id: IG_USER_ID,
    fields: 'id,permalink,caption,comments_count,like_count,timestamp,media_type',
    access_token: IG_ACCESS_TOKEN
  });
  return res.data || [];
}

function todayHashtags(date) {
  const idx = dayOfYear(date);
  const a = HASHTAGS[idx % HASHTAGS.length];
  const b = HASHTAGS[(idx + 7) % HASHTAGS.length];
  return a === b ? [a, HASHTAGS[(idx + 1) % HASHTAGS.length]] : [a, b];
}

function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

async function prospectTargets(date) {
  const hashtags = todayHashtags(date);
  console.log(`Buscando: #${hashtags[0]}, #${hashtags[1]}`);

  const allPosts = [];
  for (const tag of hashtags) {
    try {
      const id = await getHashtagId(tag);
      await sleep(500);
      const posts = await getRecentMedia(id);
      posts.forEach(p => { p._hashtag = tag; });
      allPosts.push(...posts);
      console.log(`  #${tag}: ${posts.length} posts`);
    } catch (err) {
      console.warn(`  Falha em #${tag}: ${err.message}`);
    }
    await sleep(800);
  }

  // Filtra posts da última 24h com poucos comentários
  const cutoff = new Date(date - 24 * 60 * 60 * 1000).toISOString();
  const fresh = allPosts.filter(p => p.timestamp > cutoff);
  const pool = (fresh.length >= 3 ? fresh : allPosts);

  // Ordena por menor número de comentários (comentário vai se destacar mais)
  pool.sort((a, b) => (a.comments_count || 0) - (b.comments_count || 0));

  // Deduplica por id, pega top 5
  const seen = new Set();
  const targets = [];
  for (const p of pool) {
    if (seen.has(p.id)) continue;
    seen.add(p.id);
    targets.push(p);
    if (targets.length >= 5) break;
  }

  return targets.map(p => ({
    hashtag: p._hashtag,
    permalink: p.permalink,
    caption: (p.caption || '').slice(0, 120),
    comments: p.comments_count || 0,
    likes: p.like_count || 0,
    suggestion: pickCommentTemplate(p.caption)
  }));
}

function buildEmailHtml(targets, date) {
  const dateStr = date.toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' });
  const rows = targets.map((t, i) => `
    <tr>
      <td style="padding:20px;border-bottom:1px solid #e8e2d9;vertical-align:top">
        <div style="font-size:11px;color:#9c7a4e;text-transform:uppercase;letter-spacing:.06em;margin-bottom:6px">
          ${i + 1} · #${t.hashtag} · ${t.comments} comentários
        </div>
        <a href="${t.permalink}" style="color:#a0522d;font-weight:600;font-size:15px;text-decoration:none">
          🔗 Abrir post no Instagram
        </a>
        ${t.caption ? `<div style="margin-top:8px;font-size:13px;color:#5a4a3a;font-style:italic">"${t.caption}${t.caption.length >= 120 ? '…' : ''}"</div>` : ''}
        <div style="margin-top:12px;background:#f5ede6;border-left:3px solid #a0522d;padding:10px 14px;border-radius:0 6px 6px 0">
          <div style="font-size:11px;color:#9c7a4e;text-transform:uppercase;letter-spacing:.06em;margin-bottom:4px">Sugestão de comentário</div>
          <div style="font-size:14px;color:#1a1714;line-height:1.55">${t.suggestion}</div>
        </div>
      </td>
    </tr>
  `).join('');

  return `
<!DOCTYPE html>
<html lang="pt-BR">
<body style="margin:0;padding:0;background:#faf9f7;font-family:system-ui,-apple-system,sans-serif">
  <table width="100%" cellpadding="0" cellspacing="0" style="max-width:600px;margin:0 auto;padding:20px">
    <tr>
      <td style="background:#a0522d;padding:24px 28px;border-radius:8px 8px 0 0">
        <div style="font-size:13px;color:#f5ede6;text-transform:uppercase;letter-spacing:.08em">@dai_lydevocional</div>
        <div style="font-size:22px;color:#ffffff;font-weight:700;margin-top:4px">5 perfis pra comentar hoje</div>
        <div style="font-size:13px;color:#e8c9b0;margin-top:4px">${dateStr}</div>
      </td>
    </tr>
    <tr>
      <td style="background:#ffffff;border:1px solid #e8e2d9;border-top:none">
        <table width="100%" cellpadding="0" cellspacing="0">
          ${rows}
        </table>
      </td>
    </tr>
    <tr>
      <td style="background:#f5ede6;padding:16px 28px;border-radius:0 0 8px 8px;font-size:12px;color:#9c7a4e;border:1px solid #e8e2d9;border-top:none">
        💡 Dica: adapte o comentário ao contexto do post. Comentários personalizados convertem mais visitas ao perfil do que templates colados na íntegra.
      </td>
    </tr>
  </table>
</body>
</html>`;
}

function buildTextFallback(targets, date) {
  const dateStr = date.toLocaleDateString('pt-BR', { day: 'numeric', month: 'long' });
  const lines = [`5 perfis pra comentar hoje (${dateStr})\n`];
  targets.forEach((t, i) => {
    lines.push(`${i + 1}. #${t.hashtag} | ${t.comments} comentários`);
    lines.push(`   Link: ${t.permalink}`);
    if (t.caption) lines.push(`   Post: "${t.caption.slice(0, 80)}..."`);
    lines.push(`   Sugestão: ${t.suggestion}`);
    lines.push('');
  });
  return lines.join('\n');
}

async function sendEmail(html, text, date) {
  if (!EMAIL_USER || !EMAIL_PASS) {
    console.log('EMAIL_USER/EMAIL_PASS não configurados — pulando envio de e-mail.');
    return;
  }
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: { user: EMAIL_USER, pass: EMAIL_PASS }
  });
  const dateStr = date.toLocaleDateString('pt-BR', { weekday: 'short', day: 'numeric', month: 'short' });
  await transporter.sendMail({
    from: `Devocional Diário <${EMAIL_USER}>`,
    to: EMAIL_TO,
    subject: `5 perfis pra comentar hoje — ${dateStr}`,
    html,
    text
  });
  console.log(`E-mail enviado para ${EMAIL_TO}`);
}

async function main() {
  if (!IG_ACCESS_TOKEN || !IG_USER_ID) {
    throw new Error('Faltam IG_ACCESS_TOKEN e/ou IG_USER_ID no .env');
  }
  if (!fs.existsSync(OUTPUT_DIR)) fs.mkdirSync(OUTPUT_DIR, { recursive: true });

  const date = new Date();
  const key = dateKey(date);

  const targets = await prospectTargets(date);
  if (!targets.length) {
    console.warn('Nenhum post encontrado. Verifique permissões da conta de negócios.');
    return;
  }

  console.log(`\n${targets.length} targets encontrados:`);
  targets.forEach((t, i) => console.log(`  ${i + 1}. ${t.permalink} (${t.comments} comentários)`));

  const textContent = buildTextFallback(targets, date);
  const htmlContent = buildEmailHtml(targets, date);

  const outPath = path.join(OUTPUT_DIR, `comment-targets-${key}.txt`);
  fs.writeFileSync(outPath, textContent);
  console.log(`\nLista salva: ${outPath}`);

  await sendEmail(htmlContent, textContent, date);
}

main().catch(err => {
  console.error(err.message);
  process.exit(1);
});
