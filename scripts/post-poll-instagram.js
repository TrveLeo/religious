const fs = require('fs');
const path = require('path');
const { dateKey } = require('./lib/dates.js');
const { publishCarousel, requireEnv } = require('./lib/publish.js');

const OUTPUT_DIR = path.join(__dirname, '..', 'docs', 'output');

async function publishTodayPoll() {
  const { baseUrl } = requireEnv();
  const key = dateKey(new Date());

  const pollPath = path.join(OUTPUT_DIR, `poll-${key}-1.png`);
  const donationPath = path.join(OUTPUT_DIR, `poll-${key}-2.png`);
  const captionPath = path.join(OUTPUT_DIR, `poll-${key}.txt`);

  if (!fs.existsSync(pollPath) || !fs.existsSync(donationPath) || !fs.existsSync(captionPath)) {
    throw new Error('Imagens/legenda da enquete não encontradas. Rode "npm run generate-poll-card" antes.');
  }

  const caption = fs.readFileSync(captionPath, 'utf-8');
  await publishCarousel(
    [`${baseUrl}/output/poll-${key}-1.png`, `${baseUrl}/output/poll-${key}-2.png`],
    caption
  );
}

publishTodayPoll().catch(err => {
  console.error(err.message);
  process.exit(1);
});
