// Helpers de publicação no Instagram, compartilhados pelos novos formatos.
// Centraliza o fluxo repetido de "criar item -> montar carrossel -> esperar
// processar -> publicar", evitando copiar o mesmo bloco em cada poster.
require('dotenv').config();
const { graphRequest, waitUntilReady } = require('./graph-api.js');

function requireEnv() {
  const { IG_ACCESS_TOKEN, IG_USER_ID, SITE_BASE_URL } = process.env;
  if (!IG_ACCESS_TOKEN || !IG_USER_ID || !SITE_BASE_URL) {
    throw new Error('Faltam variáveis no .env: IG_ACCESS_TOKEN, IG_USER_ID, SITE_BASE_URL');
  }
  return { token: IG_ACCESS_TOKEN, userId: IG_USER_ID, baseUrl: SITE_BASE_URL };
}

// Publica um carrossel a partir de uma lista de URLs de imagem.
async function publishCarousel(imageUrls, caption) {
  const { token, userId } = requireEnv();
  const childIds = [];

  for (let i = 0; i < imageUrls.length; i++) {
    console.log(`Criando item ${i + 1}: ${imageUrls[i]}`);
    const item = await graphRequest('POST', `${userId}/media`, {
      image_url: imageUrls[i],
      is_carousel_item: true,
      access_token: token
    });
    childIds.push(item.id);
  }

  console.log('Criando carrossel...');
  const carousel = await graphRequest('POST', `${userId}/media`, {
    media_type: 'CAROUSEL',
    caption,
    children: childIds.join(','),
    access_token: token
  });

  console.log(`Carrossel criado: ${carousel.id}`);
  console.log('Aguardando processamento...');
  await waitUntilReady(carousel.id, token);

  console.log('Publicando...');
  const published = await graphRequest('POST', `${userId}/media_publish`, {
    creation_id: carousel.id,
    access_token: token
  });

  console.log(`Publicado com sucesso! Post ID: ${published.id}`);
  return published.id;
}

// Publica uma imagem única no feed (foto + legenda).
async function publishSingle(imageUrl, caption) {
  const { token, userId } = requireEnv();

  console.log(`Criando publicação: ${imageUrl}`);
  const created = await graphRequest('POST', `${userId}/media`, {
    image_url: imageUrl,
    caption,
    access_token: token
  });

  console.log(`Mídia criada: ${created.id}`);
  await waitUntilReady(created.id, token);

  console.log('Publicando...');
  const published = await graphRequest('POST', `${userId}/media_publish`, {
    creation_id: created.id,
    access_token: token
  });

  console.log(`Publicado com sucesso! Post ID: ${published.id}`);
  return published.id;
}

// Publica uma imagem como story.
async function publishStory(imageUrl) {
  const { token, userId } = requireEnv();

  console.log(`Criando story: ${imageUrl}`);
  const created = await graphRequest('POST', `${userId}/media`, {
    image_url: imageUrl,
    media_type: 'STORIES',
    access_token: token
  });

  console.log(`Story criado: ${created.id}`);
  await waitUntilReady(created.id, token);

  console.log('Publicando...');
  const published = await graphRequest('POST', `${userId}/media_publish`, {
    creation_id: created.id,
    access_token: token
  });

  console.log(`Story publicado com sucesso! ID: ${published.id}`);
  return published.id;
}

module.exports = { requireEnv, publishCarousel, publishSingle, publishStory };
