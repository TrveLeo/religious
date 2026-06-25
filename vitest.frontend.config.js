import { defineConfig } from 'vitest/config';

// Testes do código que roda no navegador (jogos Termo/Conexões, dados de
// conteúdo compartilhados). Roda em ambiente "jsdom" pra ter document/window.
export default defineConfig({
  test: {
    name: 'frontend',
    environment: 'jsdom',
    include: ['test/frontend/**/*.test.js'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'text-summary', 'html'],
      reportsDirectory: 'coverage/frontend',
      include: [
        'docs/termo.js',
        'docs/conexo.js',
        'docs/content.js',
        'docs/termo-words.js',
        'docs/conexo-words.js',
        'docs/trivia-questions.js'
      ],
      // app.js é só bootstrap de DOM da home; sem lógica pura a testar.
      exclude: ['docs/app.js'],
      thresholds: {
        statements: 80,
        lines: 80,
        functions: 80,
        branches: 65
      }
    }
  }
});
