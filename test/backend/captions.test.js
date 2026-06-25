import { describe, it, expect } from 'vitest';
import { buildCaption as devotionalCaption } from '../../scripts/generate-image.js';
import { buildCaption as quoteCaption } from '../../scripts/generate-quote-card.js';
import { buildTermoCaption, buildConexoCaption } from '../../scripts/generate-game-images.js';
import { buildCaption as triviaCaption } from '../../scripts/generate-trivia.js';
import { buildCaption as impactCaption } from '../../scripts/generate-impact-card.js';

const date = new Date('2026-06-24T12:00:00Z');
const entry = { title: 'Título', verse: 'Versículo de teste', ref: 'João 3:16', text: 'Corpo do devocional.' };
const trivia = { question: 'Quem construiu a arca?', options: ['Noé'], correctIndex: 0, explanation: 'Noé.' };

function hashtagLine(caption) {
  return caption.split('\n').find(l => l.trim().startsWith('#')) || '';
}

describe('legendas (buildCaption)', () => {
  it('devocional: tem versículo, ref e bloco de hashtags em camadas', () => {
    const cap = devotionalCaption(entry, date);
    expect(cap).toContain('João 3:16');
    expect(hashtagLine(cap).split(' ').length).toBeGreaterThanOrEqual(15);
  });

  it('devocional: inclui chave Pix copiável', () => {
    expect(devotionalCaption(entry, date)).toContain('diariod777@gmail.com');
  });

  it('citação: tem hashtags e tag de categoria', () => {
    const cap = quoteCaption(entry, date);
    expect(hashtagLine(cap)).toContain('#citacaobiblica');
  });

  it('termo e conexões: geram legenda com hashtags de jogo', () => {
    expect(hashtagLine(buildTermoCaption(date))).toContain('#jogosbiblicos');
    expect(hashtagLine(buildConexoCaption(date))).toContain('#jogosbiblicos');
  });

  it('trivia: inclui a pergunta e hashtags', () => {
    const cap = triviaCaption(trivia, date);
    expect(cap).toContain('Quem construiu a arca?');
    expect(hashtagLine(cap)).toContain('#triviabiblica');
  });

  it('impacto: legenda menciona apoio e chave Pix', () => {
    const cap = impactCaption(date);
    expect(cap).toContain('diariod777@gmail.com');
  });
});
