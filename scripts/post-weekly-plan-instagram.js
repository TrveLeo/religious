const fs = require('fs');
const path = require('path');
const { dateKey } = require('./lib/dates.js');
const { publishCarousel, requireEnv } = require('./lib/publish.js');

const OUTPUT_DIR = path.join(__dirname, '..', 'docs', 'output');

async function publishTodayWeeklyPlan() {
  const { baseUrl } = requireEnv();
  const key = dateKey(new Date());

  const planPath = path.join(OUTPUT_DIR, `weekly-${key}-1.png`);
  const donationPath = path.join(OUTPUT_DIR, `weekly-${key}-2.png`);
  const captionPath = path.join(OUTPUT_DIR, `weekly-${key}.txt`);

  if (!fs.existsSync(planPath) || !fs.existsSync(donationPath) || !fs.existsSync(captionPath)) {
    throw new Error('Imagens/legenda do plano semanal não encontradas. Rode "npm run generate-weekly-plan" antes.');
  }

  const caption = fs.readFileSync(captionPath, 'utf-8');
  await publishCarousel(
    [`${baseUrl}/output/weekly-${key}-1.png`, `${baseUrl}/output/weekly-${key}-2.png`],
    caption
  );
}

publishTodayWeeklyPlan().catch(err => {
  console.error(err.message);
  process.exit(1);
});
