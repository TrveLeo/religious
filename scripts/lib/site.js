// Helpers puros para gerar o site estático (páginas de devocional, arquivo,
// sitemap). Sem I/O aqui — só transformação de dados em strings, pra ser
// fácil de testar. A escrita de arquivos fica em scripts/generate-site.js.

const BASE_URL = 'https://trveleo.github.io/religious';
const SITE_NAME = 'Devocional Diário';
const OG_IMAGE = `${BASE_URL}/assets/og-image.png`;

function escapeHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

// "Um dom, não uma conquista" -> "um-dom-nao-uma-conquista"
function slugify(text) {
  return String(text)
    .toLowerCase()
    .normalize('NFD').replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 60) || 'devocional';
}

// Gera slugs únicos para a lista (resolve colisões com sufixo numérico).
function buildSlugs(devotionals) {
  const seen = new Map();
  return devotionals.map(d => {
    let slug = slugify(d.title);
    if (seen.has(slug)) {
      const n = seen.get(slug) + 1;
      seen.set(slug, n);
      slug = `${slug}-${n}`;
    } else {
      seen.set(slug, 1);
    }
    return slug;
  });
}

// Bloco <head> compartilhado: meta description, canonical, Open Graph,
// Twitter card. `relPrefix` ajusta caminhos pra páginas em subpasta.
function headTags({ title, description, path, relPrefix = '' }) {
  const url = `${BASE_URL}${path}`;
  const desc = escapeHtml(description);
  return `<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${escapeHtml(title)}</title>
<meta name="description" content="${desc}">
<meta name="theme-color" content="#6b4226">
<link rel="canonical" href="${url}">
<meta property="og:type" content="article">
<meta property="og:site_name" content="${SITE_NAME}">
<meta property="og:locale" content="pt_BR">
<meta property="og:title" content="${escapeHtml(title)}">
<meta property="og:description" content="${desc}">
<meta property="og:url" content="${url}">
<meta property="og:image" content="${OG_IMAGE}">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="${escapeHtml(title)}">
<meta name="twitter:description" content="${desc}">
<meta name="twitter:image" content="${OG_IMAGE}">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@600;700&family=Lora:ital,wght@0,400;0,500;1,400&display=swap" rel="stylesheet">
<link rel="stylesheet" href="${relPrefix}style.css">`;
}

// Botões de compartilhar (WhatsApp + copiar link). `id` evita conflito se
// houver mais de um na página.
function shareButtons(shareUrl, text) {
  const wa = `https://wa.me/?text=${encodeURIComponent(`${text} ${shareUrl}`)}`;
  return `<div class="share">
  <span class="share-label">Compartilhar:</span>
  <a class="share-btn" href="${wa}" target="_blank" rel="noopener">WhatsApp</a>
  <button class="share-btn copy-link" type="button" data-url="${escapeHtml(shareUrl)}">Copiar link</button>
</div>`;
}

const SHARE_SCRIPT = `<script>
document.querySelectorAll('.copy-link').forEach(function (btn) {
  btn.addEventListener('click', function () {
    var original = btn.textContent;
    navigator.clipboard.writeText(btn.dataset.url).then(function () {
      btn.textContent = 'Link copiado!';
      setTimeout(function () { btn.textContent = original; }, 2000);
    }).catch(function () { btn.textContent = 'Copie da barra do navegador'; });
  });
});
</script>`;

// Excerto curto pra meta description (sem quebras, limitado).
function excerpt(text, max = 155) {
  const clean = String(text).replace(/\s+/g, ' ').trim();
  return clean.length <= max ? clean : `${clean.slice(0, max - 1).trimEnd()}…`;
}

// Página estática de um devocional (vive em docs/devocional/<slug>.html).
function devotionalPage(entry, slug) {
  const path = `/devocional/${slug}.html`;
  const shareUrl = `${BASE_URL}${path}`;
  const description = excerpt(`${entry.title}. ${entry.text}`);
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: entry.title,
    articleBody: entry.text,
    citation: `${entry.verse} (${entry.ref})`,
    inLanguage: 'pt-BR',
    isPartOf: { '@type': 'WebSite', name: SITE_NAME, url: BASE_URL }
  };
  return `<!DOCTYPE html>
<html lang="pt-BR">
<head>
${headTags({ title: `${entry.title} | ${SITE_NAME}`, description, path, relPrefix: '../' })}
<script type="application/ld+json">${JSON.stringify(jsonLd)}</script>
</head>
<body>
  <div class="container">
    <header>
      <h1>${escapeHtml(entry.title)}</h1>
    </header>
    <main>
      <section class="card verse-card">
        <h2>Versículo</h2>
        <p class="verse-text">"${escapeHtml(entry.verse)}"</p>
        <p class="verse-ref">${escapeHtml(entry.ref)}</p>
      </section>
      <section class="card devotional-card">
        <p class="devotional-text">${escapeHtml(entry.text).replace(/\n/g, '<br><br>')}</p>
      </section>
      ${shareButtons(shareUrl, `${entry.title} — ${SITE_NAME}`)}
    </main>
    <div class="back-link">
      <a href="../arquivo.html">← Ver todos os devocionais</a>
    </div>
    <footer><p><a href="../index.html">Devocional Diário</a></p></footer>
  </div>
  ${SHARE_SCRIPT}
</body>
</html>
`;
}

// Página de arquivo (lista todos os devocionais).
function archivePage(devotionals, slugs) {
  const items = devotionals.map((d, i) =>
    `      <li><a href="devocional/${slugs[i]}.html"><span class="arc-title">${escapeHtml(d.title)}</span><span class="arc-ref">${escapeHtml(d.ref)}</span></a></li>`
  ).join('\n');
  const path = '/arquivo.html';
  return `<!DOCTYPE html>
<html lang="pt-BR">
<head>
${headTags({ title: `Arquivo de devocionais | ${SITE_NAME}`, description: 'Todos os devocionais bíblicos do Devocional Diário, com versículo e reflexão.', path })}
</head>
<body>
  <div class="container">
    <header>
      <h1>Arquivo de devocionais</h1>
      <p class="data">Todos os devocionais publicados</p>
    </header>
    <main>
      <p class="archive-count">${devotionals.length} devocionais para ler e reler</p>
      <ul class="archive-list">
${items}
      </ul>
    </main>
    <div class="back-link">
      <a href="index.html">← Voltar ao devocional de hoje</a>
    </div>
  </div>
</body>
</html>
`;
}

// sitemap.xml a partir de uma lista de caminhos relativos.
function sitemapXml(paths, lastmod) {
  const urls = paths.map(p =>
    `  <url><loc>${BASE_URL}${p}</loc><lastmod>${lastmod}</lastmod></url>`
  ).join('\n');
  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls}
</urlset>
`;
}

module.exports = {
  BASE_URL, SITE_NAME, OG_IMAGE,
  escapeHtml, slugify, buildSlugs, headTags, shareButtons,
  SHARE_SCRIPT, excerpt, devotionalPage, archivePage, sitemapXml
};
