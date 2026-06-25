import { describe, it, expect, beforeAll } from 'vitest';

// Exercita o jogo real de Conexões no DOM: monta a tela, importa o script,
// seleciona um grupo certo e um errado. Cobre toggleSelect, submitGroup,
// categoryOf e render em uso.

const SET = {
  categories: [
    { name: 'Grupo A', color: 'yellow', words: ['A1', 'A2', 'A3', 'A4'] },
    { name: 'Grupo B', color: 'green', words: ['B1', 'B2', 'B3', 'B4'] },
    { name: 'Grupo C', color: 'blue', words: ['C1', 'C2', 'C3', 'C4'] },
    { name: 'Grupo D', color: 'purple', words: ['D1', 'D2', 'D3', 'D4'] }
  ]
};

function clickWord(word) {
  const tile = [...document.querySelectorAll('#grid .tile')].find(t => t.textContent === word);
  tile.dispatchEvent(new MouseEvent('click', { bubbles: true }));
}

function submit() {
  document.getElementById('submit-btn').dispatchEvent(new MouseEvent('click', { bubbles: true }));
}

describe('conexo - fluxo no DOM', () => {
  beforeAll(async () => {
    globalThis.CONEXO_SETS = [SET];
    localStorage.clear();
    document.body.innerHTML = `
      <div id="data"></div>
      <div id="mistakes"></div>
      <div id="grid"></div>
      <div id="found-groups"></div>
      <div id="message"></div>
      <button id="shuffle-btn"></button>
      <button id="deselect-btn"></button>
      <button id="submit-btn"></button>`;
    await import('../../docs/conexo.js');
  });

  it('renderiza 16 tiles', () => {
    expect(document.querySelectorAll('#grid .tile').length).toBe(16);
  });

  it('grupo incompleto avisa', () => {
    clickWord('A1');
    submit();
    expect(document.getElementById('message').textContent).toMatch(/Selecione 4/i);
  });

  it('grupo errado conta como erro', () => {
    document.getElementById('deselect-btn').dispatchEvent(new MouseEvent('click', { bubbles: true }));
    ['A1', 'B1', 'C1', 'D1'].forEach(clickWord);
    submit();
    expect(document.getElementById('mistakes').textContent).toBe('1');
  });

  it('grupo certo é resolvido e sai da grade', () => {
    ['A1', 'A2', 'A3', 'A4'].forEach(clickWord);
    submit();
    expect(document.getElementById('message').textContent).toMatch(/Correto/i);
    expect(document.querySelectorAll('#grid .tile').length).toBe(12);
    expect(document.querySelectorAll('#found-groups .found-group').length).toBe(1);
  });
});
