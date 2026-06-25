// Gera as páginas estáticas de SEO a partir do pool de devocionais:
// - docs/devocional/<slug>.html  (uma página por devocional, com OG + JSON-LD)
// - docs/arquivo.html            (índice navegável de todos)
// - docs/sitemap.xml             (todas as URLs do site)
// - docs/robots.txt              (aponta o sitemap)
//
// Rode após mudar content.js: `npm run generate-site`.
const fs = require('fs');
const path = require('path');
const DEVOTIONALS = require('../docs/content.js');
const { buildSlugs, devotionalPage, archivePage, sitemapXml, BASE_URL } = require('./lib/site.js');

const DOCS = path.join(__dirname, '..', 'docs');
const DEVO_DIR = path.join(DOCS, 'devocional');

function main() {
  if (!fs.existsSync(DEVO_DIR)) fs.mkdirSync(DEVO_DIR, { recursive: true });

  const slugs = buildSlugs(DEVOTIONALS);

  DEVOTIONALS.forEach((entry, i) => {
    fs.writeFileSync(path.join(DEVO_DIR, `${slugs[i]}.html`), devotionalPage(entry, slugs[i]));
  });

  fs.writeFileSync(path.join(DOCS, 'arquivo.html'), archivePage(DEVOTIONALS, slugs));

  const lastmod = new Date().toISOString().slice(0, 10);
  const paths = [
    '/',
    '/arquivo.html',
    '/doar.html',
    '/privacy.html',
    '/termo.html',
    '/conexo.html',
    ...slugs.map(s => `/devocional/${s}.html`)
  ];
  fs.writeFileSync(path.join(DOCS, 'sitemap.xml'), sitemapXml(paths, lastmod));

  fs.writeFileSync(
    path.join(DOCS, 'robots.txt'),
    `User-agent: *\nAllow: /\nSitemap: ${BASE_URL}/sitemap.xml\n`
  );

  console.log(`Gerado: ${DEVOTIONALS.length} páginas de devocional, arquivo.html, sitemap.xml, robots.txt`);
}

if (require.main === module) main();

module.exports = { main };
