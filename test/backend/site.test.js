import { describe, it, expect } from 'vitest';
import {
  escapeHtml, slugify, buildSlugs, excerpt,
  devotionalPage, archivePage, sitemapXml, BASE_URL
} from '../../scripts/lib/site.js';

describe('site - helpers', () => {
  it('escapeHtml neutraliza caracteres perigosos', () => {
    expect(escapeHtml('<a href="x">&\'')).toBe('&lt;a href=&quot;x&quot;&gt;&amp;&#39;');
  });

  it('slugify: minúsculo, sem acento, com hífens', () => {
    expect(slugify('Um dom, não uma conquista')).toBe('um-dom-nao-uma-conquista');
  });

  it('slugify: string sem alfanumérico cai no fallback', () => {
    expect(slugify('!!!')).toBe('devocional');
  });

  it('buildSlugs resolve colisões com sufixo', () => {
    const slugs = buildSlugs([{ title: 'Fé' }, { title: 'Fé' }, { title: 'Fé' }]);
    expect(slugs).toEqual(['fe', 'fe-2', 'fe-3']);
    expect(new Set(slugs).size).toBe(3);
  });

  it('excerpt corta e adiciona reticências', () => {
    const long = 'a'.repeat(300);
    const e = excerpt(long, 100);
    expect(e.length).toBeLessThanOrEqual(100);
    expect(e.endsWith('…')).toBe(true);
  });
});

describe('site - páginas geradas', () => {
  const entry = { verse: 'Versículo', ref: 'João 3:16', title: 'O amor de Deus', text: 'Linha 1.\nLinha 2.' };

  it('devotionalPage tem OG, canonical, JSON-LD e conteúdo', () => {
    const html = devotionalPage(entry, 'o-amor-de-deus');
    expect(html).toContain('<meta property="og:title"');
    expect(html).toContain('rel="canonical"');
    expect(html).toContain('application/ld+json');
    expect(html).toContain('João 3:16');
    expect(html).toContain(`${BASE_URL}/devocional/o-amor-de-deus.html`);
  });

  it('devotionalPage tem botões de compartilhar', () => {
    const html = devotionalPage(entry, 's');
    expect(html).toContain('wa.me');
    expect(html).toContain('copy-link');
  });

  it('archivePage lista todos com link pro slug', () => {
    const html = archivePage([entry], ['o-amor-de-deus']);
    expect(html).toContain('devocional/o-amor-de-deus.html');
    expect(html).toContain('O amor de Deus');
  });

  it('sitemapXml gera <url> por caminho', () => {
    const xml = sitemapXml(['/', '/arquivo.html'], '2026-06-25');
    expect(xml).toContain(`<loc>${BASE_URL}/</loc>`);
    expect(xml).toContain(`<loc>${BASE_URL}/arquivo.html</loc>`);
    expect((xml.match(/<url>/g) || []).length).toBe(2);
  });
});
