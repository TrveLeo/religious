const fs = require('fs');
const path = require('path');
const { dayOfYear, dateKey } = require('./lib/dates.js');
const { ctaTypeForDayIndex } = require('./lib/engagement.js');

const OUTPUT_DIR = path.join(__dirname, '..', 'docs', 'output');
const REPORTS_DIR = path.join(OUTPUT_DIR, 'reports');
const MEDIA_PATH = path.join(OUTPUT_DIR, 'insights-history.json');
const ACCOUNT_PATH = path.join(OUTPUT_DIR, 'account-insights-history.json');
const CLICKS_PATH = path.join(OUTPUT_DIR, 'click-stats.json');

const WINDOW_DAYS = 7;

function readJson(filePath, fallback) {
  if (!fs.existsSync(filePath)) return fallback;
  try {
    return JSON.parse(fs.readFileSync(filePath, 'utf-8'));
  } catch (_) {
    return fallback;
  }
}

function num(value) {
  return typeof value === 'number' ? value : 0;
}

// Classifica o post pelo preview da legenda para agrupar por formato.
function classifyFormat(caption = '') {
  const c = caption.toLowerCase();
  if (/termo b[íi]blico/.test(c)) return 'termo-dia';
  if (/gratid[ãa]o/.test(c)) return 'gratidao';
  if (/complete o vers/.test(c)) return 'complete-versiculo';
  if (/enquete/.test(c)) return 'enquete';
  if (/plano de leitura/.test(c)) return 'plano-semana';
  if (/4 grupos|achar os/.test(c)) return 'jogo-grupos';
  return 'devocional';
}

function slotForTimestamp(ts) {
  const hourBrt = (new Date(ts).getUTCHours() + 24 - 3) % 24;
  if (hourBrt < 12) return 'manhã (00-12)';
  if (hourBrt < 18) return 'tarde (12-18)';
  return 'noite (18-24)';
}

function avg(sum, n) {
  return n ? (sum / n) : 0;
}

function pct(part, whole) {
  return whole ? (part / whole * 100) : 0;
}

function table(headers, rows) {
  const head = `| ${headers.join(' | ')} |`;
  const sep = `| ${headers.map(() => '---').join(' | ')} |`;
  const body = rows.map(r => `| ${r.join(' | ')} |`).join('\n');
  return `${head}\n${sep}\n${body}`;
}

function windowMedia(media, until) {
  const cutoff = until.getTime() - WINDOW_DAYS * 86400000;
  return media.filter(p => !p.is_story && new Date(p.timestamp).getTime() >= cutoff);
}

function aggregateByType(posts) {
  const groups = {};
  for (const p of posts) {
    const type = p.media_product_type || p.media_type || 'DESCONHECIDO';
    const g = (groups[type] = groups[type] || { n: 0, reach: 0, views: 0, inter: 0, likes: 0 });
    g.n++;
    g.reach += num(p.insights?.reach);
    g.views += num(p.insights?.views);
    g.inter += num(p.insights?.total_interactions);
    g.likes += num(p.like_count);
  }
  return groups;
}

function aggregateByFormat(posts) {
  const groups = {};
  for (const p of posts) {
    const fmt = classifyFormat(p.caption_preview);
    const g = (groups[fmt] = groups[fmt] || { n: 0, reach: 0, views: 0, inter: 0, likes: 0 });
    g.n++;
    g.reach += num(p.insights?.reach);
    g.views += num(p.insights?.views);
    g.inter += num(p.insights?.total_interactions);
    g.likes += num(p.like_count);
  }
  return groups;
}

function aggregateBySlot(posts) {
  const groups = {};
  for (const p of posts) {
    const slot = slotForTimestamp(p.timestamp);
    const g = (groups[slot] = groups[slot] || { n: 0, reach: 0, views: 0, inter: 0 });
    g.n++;
    g.reach += num(p.insights?.reach);
    g.views += num(p.insights?.views);
    g.inter += num(p.insights?.total_interactions);
  }
  return groups;
}

// Correlaciona o tipo de CTA pedido (reconstruído pela data) com o resultado.
function aggregateByCta(posts) {
  const groups = {};
  for (const p of posts) {
    const type = ctaTypeForDayIndex(dayOfYear(new Date(p.timestamp)));
    const g = (groups[type] = groups[type] || { n: 0, reach: 0, saves: 0, shares: 0, comments: 0, inter: 0 });
    g.n++;
    g.reach += num(p.insights?.reach);
    g.saves += num(p.insights?.saved);
    g.shares += num(p.insights?.shares);
    g.comments += num(p.comments_count);
    g.inter += num(p.insights?.total_interactions);
  }
  return groups;
}

function sumWindow(posts) {
  return posts.reduce((acc, p) => {
    acc.views += num(p.insights?.views);
    acc.reach += num(p.insights?.reach);
    acc.inter += num(p.insights?.total_interactions);
    acc.likes += num(p.like_count);
    acc.saves += num(p.insights?.saved);
    acc.shares += num(p.insights?.shares);
    acc.comments += num(p.comments_count);
    return acc;
  }, { views: 0, reach: 0, inter: 0, likes: 0, saves: 0, shares: 0, comments: 0 });
}

function followerTrend(account) {
  const series = account?.insights?.time_series?.follower_count;
  if (!Array.isArray(series)) return null;
  const recent = series.slice(-WINDOW_DAYS);
  const total = recent.reduce((s, d) => s + num(d.value), 0);
  return { recent, total };
}

function topDemographics(account, metric, breakdown, limit) {
  const node = account?.insights?.demographics?.[metric]?.[breakdown];
  const results = node?.breakdowns?.[0]?.results;
  if (!Array.isArray(results)) return [];
  return results
    .map(r => ({ key: r.dimension_values?.[0] ?? '?', value: num(r.value) }))
    .sort((a, b) => b.value - a.value)
    .slice(0, limit);
}

function clicksInWindow(clicks, until) {
  if (!Array.isArray(clicks)) return null;
  const cutoff = until.getTime() - WINDOW_DAYS * 86400000;
  return clicks
    .filter(d => new Date(d.date).getTime() >= cutoff)
    .reduce((acc, d) => ({ bio: acc.bio + num(d.bio), pix: acc.pix + num(d.pix) }), { bio: 0, pix: 0 });
}

function buildReport({ media, account, clicks, until }) {
  const posts = windowMedia(media, until);
  const lines = [];
  const collectedAt = account?.collected_at || dateKey(until);

  lines.push(`# Relatório semanal — Devocional Diário`);
  lines.push('');
  lines.push(`Janela: últimos ${WINDOW_DAYS} dias até ${dateKey(until)} · snapshot de conta: ${collectedAt}`);
  lines.push('');

  // --- Conta ---
  const profile = account?.profile || {};
  const totals = account?.insights?.totals || {};
  lines.push('## Conta');
  lines.push('');
  lines.push(`- Seguidores: **${profile.followers_count ?? '-'}** · Posts: ${profile.media_count ?? '-'}`);
  lines.push(`- Alcance 30d: ${num(totals.reach)} · Views 30d: ${num(totals.views)} · Contas engajadas: ${num(totals.accounts_engaged)}`);
  lines.push(`- Visitas ao perfil: ${num(totals.profile_views)} · Cliques no site: ${num(totals.website_clicks)} (CTR ${pct(num(totals.website_clicks), num(totals.profile_views)).toFixed(1)}%)`);

  const trend = followerTrend(account);
  if (trend) {
    lines.push(`- Novos seguidores (${WINDOW_DAYS}d): **${trend.total}**`);
    lines.push('');
    lines.push('Crescimento diário:');
    lines.push('');
    lines.push(table(['Dia', 'Novos seg.'], trend.recent.map(d => [d.end_time.slice(0, 10), String(num(d.value))])));
  }
  lines.push('');

  // --- Resumo da semana ---
  const sum = sumWindow(posts);
  lines.push('## Resumo da semana (mídia)');
  lines.push('');
  lines.push(`- Posts: **${posts.length}** · Views: ${sum.views} · Alcance: ${sum.reach}`);
  lines.push(`- Interações: ${sum.inter} · Likes: ${sum.likes} · **Salvos: ${sum.saves}** · **Shares: ${sum.shares}** · **Comentários: ${sum.comments}**`);
  if (sum.saves === 0 && sum.shares === 0 && sum.comments === 0) {
    lines.push('');
    lines.push('> ⚠️ Zero salvos/shares/comentários na semana — sinais que o algoritmo usa pra escalar alcance. Gargalo principal.');
  }
  lines.push('');

  // --- Por tipo ---
  lines.push('## Por tipo de mídia');
  lines.push('');
  lines.push(table(
    ['Tipo', 'n', 'Reach méd.', 'Views méd.', 'Eng% (int/reach)'],
    Object.entries(aggregateByType(posts))
      .sort((a, b) => pct(b[1].inter, b[1].reach) - pct(a[1].inter, a[1].reach))
      .map(([t, g]) => [t, String(g.n), avg(g.reach, g.n).toFixed(1), avg(g.views, g.n).toFixed(1), pct(g.inter, g.reach).toFixed(1)])
  ));
  lines.push('');

  // --- Por formato ---
  lines.push('## Por formato de conteúdo');
  lines.push('');
  lines.push('Eng% normaliza pelo alcance — decoupla do tamanho da audiência. Com n=1 não decide nada; sinal real precisa de várias semanas.');
  lines.push('');
  lines.push(table(
    ['Formato', 'n', 'Reach méd.', 'Views méd.', 'Eng%', 'Likes méd.'],
    Object.entries(aggregateByFormat(posts))
      .sort((a, b) => pct(b[1].inter, b[1].reach) - pct(a[1].inter, a[1].reach))
      .map(([f, g]) => [f, String(g.n), avg(g.reach, g.n).toFixed(0), avg(g.views, g.n).toFixed(0), pct(g.inter, g.reach).toFixed(1), avg(g.likes, g.n).toFixed(1)])
  ));
  lines.push('');

  // --- Por horário ---
  lines.push('## Por faixa de horário (BRT)');
  lines.push('');
  lines.push(table(
    ['Faixa', 'n', 'Views méd.', 'Reach méd.', 'Inter. méd.'],
    Object.entries(aggregateBySlot(posts))
      .map(([s, g]) => [s, String(g.n), avg(g.views, g.n).toFixed(1), avg(g.reach, g.n).toFixed(1), avg(g.inter, g.n).toFixed(2)])
  ));
  lines.push('');

  // --- A/B de CTA ---
  lines.push('## A/B de CTA (pedido único por post)');
  lines.push('');
  lines.push('Tipo de CTA reconstruído pela data de publicação. Acompanhar qual sinal converte ao longo das semanas.');
  lines.push('');
  lines.push(table(
    ['CTA pedido', 'n posts', 'Salvos', 'Shares', 'Comentários', 'Eng%'],
    Object.entries(aggregateByCta(posts))
      .map(([t, g]) => [t, String(g.n), String(g.saves), String(g.shares), String(g.comments), pct(g.inter, g.reach).toFixed(1)])
  ));
  lines.push('');

  // --- Top / bottom ---
  const sorted = [...posts].sort((a, b) => num(b.insights?.views) - num(a.insights?.views));
  const fmtRow = p => [
    p.timestamp.slice(0, 10),
    p.media_product_type || p.media_type,
    String(num(p.insights?.views)),
    String(num(p.insights?.reach)),
    String(num(p.like_count)),
    (p.caption_preview || '').slice(0, 40)
  ];
  lines.push('## Top 5 / Bottom 5 por views');
  lines.push('');
  lines.push('**Top 5**');
  lines.push('');
  lines.push(table(['Data', 'Tipo', 'Views', 'Reach', 'Likes', 'Legenda'], sorted.slice(0, 5).map(fmtRow)));
  lines.push('');
  lines.push('**Bottom 5**');
  lines.push('');
  lines.push(table(['Data', 'Tipo', 'Views', 'Reach', 'Likes', 'Legenda'], sorted.slice(-5).map(fmtRow)));
  lines.push('');

  // --- Funil ---
  lines.push('## Funil de conversão');
  lines.push('');
  lines.push(`- Perfil → site (Instagram): ${num(totals.profile_views)} visitas → ${num(totals.website_clicks)} cliques (${pct(num(totals.website_clicks), num(totals.profile_views)).toFixed(1)}%)`);
  const clk = clicksInWindow(clicks, until);
  if (clk) {
    lines.push(`- Cliques rastreados (Worker): bio ${clk.bio} · pix ${clk.pix}`);
  } else {
    lines.push('- Cliques rastreados (Worker): sem `click-stats.json` (rode `npm run fetch-click-stats`).');
  }
  lines.push('');

  // --- Demografia ---
  const age = topDemographics(account, 'follower_demographics', 'age', 7);
  const gender = topDemographics(account, 'follower_demographics', 'gender', 3);
  const cities = topDemographics(account, 'follower_demographics', 'city', 6);
  if (age.length || gender.length || cities.length) {
    lines.push('## Demografia de seguidores');
    lines.push('');
    if (age.length) lines.push(`- Idade: ${age.map(x => `${x.key} (${x.value})`).join(' · ')}`);
    if (gender.length) lines.push(`- Gênero: ${gender.map(x => `${x.key} (${x.value})`).join(' · ')}`);
    if (cities.length) lines.push(`- Cidades: ${cities.map(x => `${x.key} (${x.value})`).join(' · ')}`);
    lines.push('');
  }

  return lines.join('\n');
}

function main() {
  const media = readJson(MEDIA_PATH, []);
  const accountHistory = readJson(ACCOUNT_PATH, []);
  const clicks = readJson(CLICKS_PATH, null);

  if (!media.length) {
    throw new Error('Sem dados de mídia. Rode "npm run fetch-insights" antes.');
  }

  const account = accountHistory[0] || null;
  const until = new Date();

  const report = buildReport({ media, account, clicks, until });

  if (!fs.existsSync(REPORTS_DIR)) fs.mkdirSync(REPORTS_DIR, { recursive: true });
  const outPath = path.join(REPORTS_DIR, `weekly-report-${dateKey(until)}.md`);
  fs.writeFileSync(outPath, report);

  console.log(report);
  console.log(`\nRelatório salvo em ${outPath}`);
}

if (require.main === module) main();

module.exports = { classifyFormat, slotForTimestamp, aggregateByCta, buildReport };
