require('dotenv').config();
const fs = require('fs');
const path = require('path');
const nodemailer = require('nodemailer');
const { dayOfYear, dateKey } = require('./lib/dates.js');

const EMAIL_USER = process.env.EMAIL_USER;
const EMAIL_PASS = process.env.EMAIL_PASS;
const EMAIL_TO = 'leo.trve@gmail.com';
const OUTPUT_DIR = path.join(__dirname, '..', 'docs', 'output');

// 15 hashtags — rota 2 por dia. Sem depender de API de busca (exige token
// de usuário Facebook, diferente do token do projeto).
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

// Sugestões de comentário por tema. O usuário escolhe a que melhor encaixa
// no post que encontrar ao explorar as hashtags.
const COMMENT_SUGGESTIONS = [
  {
    tema: 'Ansiedade / medo',
    text: 'Que palavra necessária. Ansiedade é muito mais comum entre cristãos do que a gente admite — obrigado por falar disso com tanta honestidade 🙏'
  },
  {
    tema: 'Cansaço / esgotamento',
    text: 'Isso ministrou aqui. É exatamente nos momentos em que não sobra mais nada que Deus age com mais clareza. Palavra certa na hora certa.'
  },
  {
    tema: 'Solidão / abandono',
    text: 'Essa palavra chega onde a maioria das pregações não chega. Solidão é um peso que muita gente carrega em silêncio — obrigado por trazer isso à luz 🙏'
  },
  {
    tema: 'Decisão / direção',
    text: 'Faz muito sentido. Buscar direção antes de decidir, não depois de errar — é uma diferença que muda tudo. Boa reflexão.'
  },
  {
    tema: 'Recomeço / renovação',
    text: 'Que esperança real isso traz. Recomeçar não é fingir que nada aconteceu — é exatamente o que você disse aqui. Amém 🙏'
  },
  {
    tema: 'Fé em crise / dúvida',
    text: 'Que honestidade. A fé imperfeita que você descreve aqui é muito mais real do que qualquer coisa que ignora a dúvida. Obrigado por isso.'
  },
  {
    tema: 'Oração / clamor',
    text: 'Amém. Oração não muda necessariamente a situação — mas muda quem está na situação. Isso aqui é verdade.'
  },
  {
    tema: 'Genérico (qualquer post)',
    text: 'Que palavra. Isso chegou de forma muito específica hoje — é daqueles posts que a gente para pra reler. Abençoado 🙏'
  }
];

function todayHashtags(date) {
  const idx = dayOfYear(date);
  const a = HASHTAGS[idx % HASHTAGS.length];
  const b = HASHTAGS[(idx + 7) % HASHTAGS.length];
  return a === b ? [a, HASHTAGS[(idx + 1) % HASHTAGS.length]] : [a, b];
}

function buildEmailHtml(hashtags, date) {
  const dateStr = date.toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' });

  const hashtagLinks = hashtags.map((tag, i) => `
    <tr>
      <td style="padding:16px 24px;border-bottom:1px solid #e8e2d9">
        <div style="font-size:11px;color:#9c7a4e;text-transform:uppercase;letter-spacing:.06em;margin-bottom:6px">Hashtag ${i + 1}</div>
        <a href="https://www.instagram.com/explore/tags/${tag}/"
           style="font-size:18px;font-weight:700;color:#a0522d;text-decoration:none">#${tag}</a>
        <div style="margin-top:6px;font-size:13px;color:#7a6e64">
          Abra no celular → explore posts recentes → comente em 2 ou 3
        </div>
      </td>
    </tr>
  `).join('');

  const suggestionRows = COMMENT_SUGGESTIONS.map(s => `
    <tr>
      <td style="padding:12px 24px;border-bottom:1px solid #e8e2d9;vertical-align:top">
        <div style="font-size:11px;font-weight:700;color:#9c7a4e;text-transform:uppercase;letter-spacing:.05em;margin-bottom:4px">${s.tema}</div>
        <div style="font-size:14px;color:#1a1714;line-height:1.55">${s.text}</div>
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
        <div style="font-size:12px;color:#f5ede6;text-transform:uppercase;letter-spacing:.08em">@dai_lydevocional · Interação no nicho</div>
        <div style="font-size:22px;color:#ffffff;font-weight:700;margin-top:4px">Hashtags de hoje para comentar</div>
        <div style="font-size:13px;color:#e8c9b0;margin-top:4px">${dateStr}</div>
      </td>
    </tr>

    <tr>
      <td style="background:#ffffff;border:1px solid #e8e2d9;border-top:none;border-bottom:none">
        <table width="100%" cellpadding="0" cellspacing="0">
          <tr><td style="padding:16px 24px 8px;font-size:13px;color:#5a4a3a;font-weight:600">🔗 Abra no celular e explore os posts recentes:</td></tr>
          ${hashtagLinks}
        </table>
      </td>
    </tr>

    <tr>
      <td style="background:#f5ede6;padding:14px 24px;border:1px solid #e8e2d9;border-top:none;border-bottom:none">
        <div style="font-size:13px;color:#6b4226;line-height:1.55">
          <strong>Meta:</strong> 5 comentários por dia, nos posts com menos comentários (onde seu texto vai se destacar mais).
          Prefira posts de contas menores — o dono da conta provavelmente vai ler e visitar o seu perfil.
        </div>
      </td>
    </tr>

    <tr>
      <td style="background:#ffffff;border:1px solid #e8e2d9;border-top:none">
        <table width="100%" cellpadding="0" cellspacing="0">
          <tr><td style="padding:16px 24px 8px;font-size:13px;color:#5a4a3a;font-weight:600">💬 Sugestões de comentário (escolha a que encaixar no post):</td></tr>
          ${suggestionRows}
        </table>
      </td>
    </tr>

    <tr>
      <td style="background:#f5ede6;padding:14px 24px;border-radius:0 0 8px 8px;border:1px solid #e8e2d9;border-top:none;font-size:12px;color:#9c7a4e;line-height:1.6">
        💡 Adapte sempre ao contexto real do post. Um comentário levemente personalizado converte muito mais visitas ao perfil do que um texto colado na íntegra.
      </td>
    </tr>

  </table>
</body>
</html>`;
}

function buildTextFallback(hashtags, date) {
  const dateStr = date.toLocaleDateString('pt-BR', { day: 'numeric', month: 'long' });
  const lines = [
    `Hashtags para comentar hoje (${dateStr})`,
    '',
    ...hashtags.map((tag, i) => `${i + 1}. #${tag}\n   https://www.instagram.com/explore/tags/${tag}/`),
    '',
    'Meta: 5 comentários em posts recentes com poucos comentários.',
    '',
    'Sugestões de comentário:',
    ...COMMENT_SUGGESTIONS.map(s => `\n[${s.tema}]\n${s.text}`)
  ];
  return lines.join('\n');
}

async function sendEmail(html, text, date) {
  if (!EMAIL_USER || !EMAIL_PASS) {
    console.log('EMAIL_USER/EMAIL_PASS não configurados — pulando envio.');
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
    subject: `Hashtags pra comentar hoje — ${dateStr}`,
    html,
    text
  });
  console.log(`E-mail enviado para ${EMAIL_TO}`);
}

async function main() {
  if (!fs.existsSync(OUTPUT_DIR)) fs.mkdirSync(OUTPUT_DIR, { recursive: true });

  const date = new Date();
  const key = dateKey(date);
  const hashtags = todayHashtags(date);

  console.log(`Hashtags do dia: #${hashtags[0]}, #${hashtags[1]}`);

  const text = buildTextFallback(hashtags, date);
  const html = buildEmailHtml(hashtags, date);

  const outPath = path.join(OUTPUT_DIR, `comment-targets-${key}.txt`);
  fs.writeFileSync(outPath, text);
  console.log(`Arquivo salvo: ${outPath}`);

  await sendEmail(html, text, date);
}

main().catch(err => {
  console.error(err.message);
  process.exit(1);
});
