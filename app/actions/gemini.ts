'use server';

import { GoogleGenAI } from '@google/genai';

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
});

export const handleGeneratePost = async (prompt: string) => {
  const finalPrompt = `
    Write a short and engaging social media post.
    Keep it concise (max 2–3 sentences).
    User’s request: ${prompt}
  `;

  try {
    const result = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: [{ text: finalPrompt }],
    });

    const resultText = result.text?.trim();

    if (!resultText) {
      console.error('Empty AI response');
      return '⚠️ AI did not generate a response. Try again with a different prompt.';
    }

    console.log('Generated post:', resultText);
    return resultText;
  } catch (err) {
    console.error('Error generating post:', err);
    return '⚠️ Something went wrong while generating the post.';
  }
};
