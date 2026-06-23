function dayOfYear(date) {
  const start = new Date(date.getFullYear(), 0, 0);
  return Math.floor((date - start) / 86400000);
}

function todayKey() {
  const now = new Date();
  return `${now.getFullYear()}-${now.getMonth() + 1}-${now.getDate()}`;
}

function wordOfTheDay() {
  const now = new Date();
  const index = dayOfYear(now) % TERMO_WORDS.length;
  return TERMO_WORDS[index];
}

const WORD = wordOfTheDay();
const MAX_ATTEMPTS = 6;
const WORD_LEN = 5;

const STORAGE_KEY = `termo-biblico-${todayKey()}`;

let state = loadState();

function loadState() {
  const saved = localStorage.getItem(STORAGE_KEY);
  if (saved) return JSON.parse(saved);
  return { guesses: [], current: "", finished: false, won: false };
}

function saveState() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

const KEY_ROWS = [
  "QWERTYUIOP",
  "ASDFGHJKL",
  "ZXCVBNM"
];

function buildKeyboard() {
  const keyboard = document.getElementById('keyboard');
  keyboard.innerHTML = "";
  KEY_ROWS.forEach((row, i) => {
    const rowEl = document.createElement('div');
    rowEl.className = 'key-row';
    if (i === 2) rowEl.appendChild(makeKey('ENTER', true));
    row.split("").forEach(letter => rowEl.appendChild(makeKey(letter)));
    if (i === 2) rowEl.appendChild(makeKey('←', true));
    keyboard.appendChild(rowEl);
  });
}

function makeKey(label, wide) {
  const btn = document.createElement('button');
  btn.className = 'key' + (wide ? ' wide' : '');
  btn.textContent = label;
  btn.dataset.key = label;
  btn.addEventListener('click', () => handleKey(label));
  return btn;
}

function handleKey(label) {
  if (state.finished) return;
  if (label === 'ENTER') {
    submitGuess();
  } else if (label === '←') {
    state.current = state.current.slice(0, -1);
  } else if (state.current.length < WORD_LEN) {
    state.current += label;
  }
  saveState();
  render();
}

function submitGuess() {
  if (state.current.length !== WORD_LEN) {
    showMessage("Palavra incompleta.");
    return;
  }
  state.guesses.push(state.current);
  if (state.current === WORD) {
    state.finished = true;
    state.won = true;
    showMessage("Parabéns! Você acertou!");
  } else if (state.guesses.length >= MAX_ATTEMPTS) {
    state.finished = true;
    state.won = false;
    showMessage(`Não foi dessa vez. Palavra: ${WORD}`);
  }
  state.current = "";
}

function showMessage(msg) {
  document.getElementById('message').textContent = msg;
}

function evaluateGuess(guess) {
  const result = new Array(WORD_LEN).fill('absent');
  const wordLetters = WORD.split("");
  const used = new Array(WORD_LEN).fill(false);

  for (let i = 0; i < WORD_LEN; i++) {
    if (guess[i] === wordLetters[i]) {
      result[i] = 'correct';
      used[i] = true;
    }
  }
  for (let i = 0; i < WORD_LEN; i++) {
    if (result[i] === 'correct') continue;
    const idx = wordLetters.findIndex((l, j) => l === guess[i] && !used[j]);
    if (idx !== -1) {
      result[i] = 'present';
      used[idx] = true;
    }
  }
  return result;
}

function render() {
  document.getElementById('data').textContent =
    new Date().toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });

  const board = document.getElementById('board');
  board.innerHTML = "";

  const keyStatus = {};

  for (let r = 0; r < MAX_ATTEMPTS; r++) {
    const rowEl = document.createElement('div');
    rowEl.className = 'row';
    const guess = state.guesses[r];
    const isCurrentRow = r === state.guesses.length && !state.finished;
    const letters = guess
      ? guess.split("")
      : (isCurrentRow ? state.current.padEnd(WORD_LEN, " ").split("") : Array(WORD_LEN).fill(" "));
    const evaluation = guess ? evaluateGuess(guess) : null;

    for (let c = 0; c < WORD_LEN; c++) {
      const cell = document.createElement('div');
      cell.className = 'cell';
      const letter = letters[c];
      cell.textContent = letter.trim();
      if (evaluation) {
        cell.classList.add(evaluation[c]);
        const prev = keyStatus[letter];
        if (!prev || (prev === 'absent') || (prev === 'present' && evaluation[c] === 'correct')) {
          keyStatus[letter] = evaluation[c];
        }
      }
      rowEl.appendChild(cell);
    }
    board.appendChild(rowEl);
  }

  document.querySelectorAll('.key').forEach(btn => {
    const k = btn.dataset.key;
    btn.classList.remove('correct', 'present', 'absent');
    if (keyStatus[k]) btn.classList.add(keyStatus[k]);
  });

  if (state.finished && !document.getElementById('message').textContent) {
    showMessage(state.won ? "Parabéns! Você acertou!" : `Não foi dessa vez. Palavra: ${WORD}`);
  }
}

document.addEventListener('keydown', (e) => {
  const key = e.key.toUpperCase();
  if (key === 'ENTER') handleKey('ENTER');
  else if (key === 'BACKSPACE') handleKey('←');
  else if (/^[A-Z]$/.test(key)) handleKey(key);
});

buildKeyboard();
render();
