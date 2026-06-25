import { describe, it, expect, beforeAll } from 'vitest';

// Exercita o jogo real do Termo num DOM jsdom: monta a tela, importa o
// script (que faz o bootstrap), digita um palpite e confere o resultado.
// Cobre buildKeyboard, handleKey, submitGuess, render e evaluateGuess em uso.

function type(letters) {
  for (const ch of letters) {
    document.dispatchEvent(new KeyboardEvent('keydown', { key: ch }));
  }
}

describe('termo - fluxo no DOM', () => {
  beforeAll(async () => {
    // Lista de uma palavra => palavra do dia é sempre REINO.
    globalThis.TERMO_WORDS = ['REINO'];
    localStorage.clear();
    document.body.innerHTML = `
      <div id="data"></div>
      <div id="board"></div>
      <div id="message"></div>
      <div id="keyboard"></div>`;
    await import('../../docs/termo.js');
  });

  it('monta o teclado com botões', () => {
    expect(document.querySelectorAll('#keyboard .key').length).toBeGreaterThan(0);
  });

  it('palpite incompleto mostra aviso', () => {
    type('REI');
    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter' }));
    expect(document.getElementById('message').textContent).toMatch(/incompleta/i);
  });

  it('backspace apaga letra do palpite atual', () => {
    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Backspace' }));
    // sem erro; estado segue jogável
    expect(document.getElementById('board').children.length).toBe(6);
  });

  it('palpite correto vence o jogo', () => {
    // limpa qualquer letra pendente e digita a palavra do zero
    for (let i = 0; i < 6; i++) document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Backspace' }));
    type('REINO');
    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter' }));
    expect(document.getElementById('message').textContent).toMatch(/acertou/i);
    const cells = document.querySelectorAll('#board .row:first-child .cell.correct');
    expect(cells.length).toBe(5);
  });
});
