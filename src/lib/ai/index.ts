import { createOpenAICompatible } from '@ai-sdk/openai-compatible';
import { experimental_wrapLanguageModel as wrapLanguageModel } from 'ai';

import { customMiddleware } from '@/lib/ai/custom-middleware';

const litellm = createOpenAICompatible({
  name: 'litellm',
  baseURL: process.env.LITELLM_ENDPOINT,
  fetch: async (url, request) => {
    return await fetch(url, { ...request });
  },
});

export const customModel = (apiIdentifier: string) => {
  return wrapLanguageModel({
    model: litellm(apiIdentifier),
    middleware: customMiddleware,
  });
};