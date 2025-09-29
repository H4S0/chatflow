'use server';

import { StreamClient } from '@stream-io/node-sdk';

const STREAM_API_KEY = process.env.STREAM_API_KEY;
const STREAM_API_SECRET = process.env.STREAM_API_SECRET;

export const generateStreamToken = async (userId: string) => {
  if (!STREAM_API_KEY) throw new Error('Stream api key secret is missing');
  if (!STREAM_API_SECRET) throw new Error('Stream api secret is missing');

  const streamClient = new StreamClient(STREAM_API_KEY, STREAM_API_SECRET);

  const expirationTime = Math.floor(Date.now() / 1000) + 3600;
  const issuedAt = Math.floor(Date.now() / 1000) - 60;

  const token = streamClient.generateUserToken({
    user_id: userId,
    iat: issuedAt,
    exp: expirationTime,
  });

  return token;
};

export async function getStreamConfig(userId: string) {
  if (!process.env.STREAM_API_KEY) {
    throw new Error('Stream API key is missing');
  }

  return {
    apiKey: process.env.STREAM_API_KEY,
    user: {
      id: userId,
      name: 'Anonymous',
      image: null,
    },
    token: await generateStreamToken(userId),
  };
}
