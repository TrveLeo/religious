function dayOfYear(date) {
  const start = new Date(date.getFullYear(), 0, 0);
  const diff = date - start;
  return Math.floor(diff / 86400000);
}

function render() {
  const now = new Date();
  const index = dayOfYear(now) % DEVOTIONALS.length;
  const entry = DEVOTIONALS[index];

  document.getElementById('data').textContent =
    now.toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });

  document.getElementById('verse-text').textContent = `"${entry.verse}"`;
  document.getElementById('verse-ref').textContent = entry.ref;
  document.getElementById('devotional-title').textContent = entry.title;
  document.getElementById('devotional-text').textContent = entry.text;
}

render();

// Reagenda render automaticamente na virada do dia, sem precisar recarregar a página.
function scheduleMidnightUpdate() {
  const now = new Date();
  const nextMidnight = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1, 0, 0, 5);
  const ms = nextMidnight - now;
  setTimeout(() => {
    render();
    scheduleMidnightUpdate();
  }, ms);
}

scheduleMidnightUpdate();
