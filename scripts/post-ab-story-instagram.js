const fs = require('fs');
const path = require('path');
const { dateKey } = require('./lib/dates.js');
const { publishStory, requireEnv } = require('./lib/publish.js');

const OUTPUT_DIR = path.join(__dirname, '..', 'docs', 'output');

async function publishTodayAbStory() {
  const { baseUrl } = requireEnv();
  const key = dateKey(new Date());

  const storyPath = path.join(OUTPUT_DIR, `ab-story-${key}.jpg`);
  if (!fs.existsSync(storyPath)) {
    throw new Error('Story A/B de hoje não encontrado. Rode "npm run generate-ab-story" antes.');
  }

  await publishStory(`${baseUrl}/output/ab-story-${key}.jpg`);
}

publishTodayAbStory().catch(err => {
  console.error(err.message);
  process.exit(1);
});
