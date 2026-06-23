function dayOfYear(date) {
  const start = new Date(date.getFullYear(), 0, 0);
  return Math.floor((date - start) / 86400000);
}

function todayKey() {
  const now = new Date();
  return `${now.getFullYear()}-${now.getMonth() + 1}-${now.getDate()}`;
}

function setOfTheDay() {
  const now = new Date();
  const index = dayOfYear(now) % CONEXO_SETS.length;
  return CONEXO_SETS[index];
}

const SET = setOfTheDay();
const MAX_MISTAKES = 4;
const STORAGE_KEY = `conexo-biblico-${todayKey()}`;

let allWords = SET.categories.flatMap(cat => cat.words.map(w => ({ word: w, category: cat.name })));

let state = loadState();

function loadState() {
  const saved = localStorage.getItem(STORAGE_KEY);
  if (saved) return JSON.parse(saved);
  return {
    order: shuffle(allWords.map(w => w.word)),
    selected: [],
    solvedCategories: [],
    mistakes: 0,
    finished: false
  };
}

function saveState() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function categoryOf(word) {
  return SET.categories.find(cat => cat.words.includes(word));
}

function showMessage(msg) {
  document.getElementById('message').textContent = msg;
}

function toggleSelect(word) {
  if (state.finished) return;
  if (state.solvedCategories.some(c => c.words.includes(word))) return;

  const idx = state.selected.indexOf(word);
  if (idx !== -1) {
    state.selected.splice(idx, 1);
  } else if (state.selected.length < 4) {
    state.selected.push(word);
  }
  saveState();
  render();
}

function submitGroup() {
  if (state.selected.length !== 4) {
    showMessage("Selecione 4 palavras.");
    return;
  }
  const cats = state.selected.map(categoryOf);
  const sameCategory = cats.every(c => c.name === cats[0].name);

  if (sameCategory) {
    state.solvedCategories.push(cats[0]);
    state.selected = [];
    showMessage(`Correto: ${cats[0].name}`);
    if (state.solvedCategories.length === SET.categories.length) {
      state.finished = true;
      showMessage("Parabéns! Você encontrou todos os grupos!");
    }
  } else {
    state.mistakes++;
    state.selected = [];
    if (state.mistakes >= MAX_MISTAKES) {
      state.finished = true;
      showMessage("Fim das tentativas. Tente novamente amanhã!");
    } else {
      showMessage("Esse grupo não está certo.");
    }
  }
  saveState();
  render();
}

function render() {
  document.getElementById('data').textContent =
    new Date().toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });

  document.getElementById('mistakes').textContent = state.mistakes;

  const grid = document.getElementById('grid');
  grid.innerHTML = "";

  const solvedWords = state.solvedCategories.flatMap(c => c.words);

  state.order
    .filter(word => !solvedWords.includes(word))
    .forEach(word => {
      const tile = document.createElement('div');
      tile.className = 'tile';
      if (state.selected.includes(word)) tile.classList.add('selected');
      tile.textContent = word;
      tile.addEventListener('click', () => toggleSelect(word));
      grid.appendChild(tile);
    });

  const foundGroupsEl = document.getElementById('found-groups');
  foundGroupsEl.innerHTML = "";
  state.solvedCategories.forEach(cat => {
    const div = document.createElement('div');
    div.className = `found-group ${cat.color}`;
    div.textContent = `${cat.name}: ${cat.words.join(", ")}`;
    foundGroupsEl.appendChild(div);
  });
}

document.getElementById('shuffle-btn').addEventListener('click', () => {
  state.order = shuffle(state.order);
  saveState();
  render();
});

document.getElementById('deselect-btn').addEventListener('click', () => {
  state.selected = [];
  saveState();
  render();
});

document.getElementById('submit-btn').addEventListener('click', submitGroup);

render();
