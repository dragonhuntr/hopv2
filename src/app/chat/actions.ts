import { type CoreUserMessage, generateText } from 'ai';
import { customModel } from '@/lib/ai';
import { titlePrompt } from '@/lib/ai/prompts';

export async function generateTitleFromUserMessage({
    message,
    model,
  }: {
    message: CoreUserMessage;
    model: string;
  }) {
    const { text: title } = await generateText({
      model: customModel(model),
      system: titlePrompt(message),
      prompt: JSON.stringify(message),
    });
  
    return title;
  }