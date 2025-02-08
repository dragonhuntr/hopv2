import type { Model } from '@/types/model';

export const models: Array<Model> = [
    {
        id: 'llama3.3',
        label: 'Llama 3.3',
        apiIdentifier: 'llama3.3',
        description: 'For complex, multi-step tasks',
        vision: false,
    },
    /**{
        id: 'llama3.2-vision',
        label: 'Llama 3.2 Vision',
        apiIdentifier: 'llama3.2-vision',
        description: 'For complex, multi-step tasks',
        vision: true,
    },*/
    {
        id: 'deepseek-r1',
        label: 'DeepSeek-R1',
        apiIdentifier: 'deepseek-r1',
        description: 'For complex, multi-step tasks',
        vision: false,
    },
    {
        id: 'gemini-flash',
        label: 'Gemini Flash 2.0',
        apiIdentifier: 'gemini-flash',
        description: 'For complex, multi-step tasks',
        vision: true,
    },
] as const;

export const DEFAULT_MODEL_ID: string = 'gemini-flash';
export const DEFAULT_TITLE_MODEL_ID: string = 'gemini-flash';