import { defineConfig } from 'vitest/config';

// Testes do código Node (scripts de geração/publicação, libs compartilhadas
// e os Cloudflare Workers). Roda em ambiente "node".
export default defineConfig({
  test: {
    name: 'backend',
    environment: 'node',
    include: ['test/backend/**/*.test.js'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'text-summary', 'html'],
      reportsDirectory: 'coverage/backend',
      // Cobertura mede a superfície de lógica pura/reutilizável: libs e os
      // dois Workers. Os generate-*.js são majoritariamente desenho em canvas
      // e escrita de arquivo (efeito colateral); a lógica deles que importa
      // (buildCaption) é testada em captions.test.js, mas não é contada aqui
      // pra não diluir o número com I/O sem valor de teste unitário. post-*/
      // fetch-* são só publicação/rede.
      include: [
        'scripts/lib/**/*.js',
        'webhook/src/**/*.js',
        'webhook-redirect/src/**/*.js'
      ],
      thresholds: {
        statements: 80,
        lines: 80,
        functions: 80,
        branches: 65
      }
    }
  }
});
