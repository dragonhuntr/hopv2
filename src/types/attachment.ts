export type Extension = '.jpg' | '.jpeg' | '.png' | '.gif' | '.webp' | '.pdf' | '.txt' | '.md' | '.js' | '.jsx' | '.ts' | '.tsx' | '.py' | '.json' | '.csv';

export const ALLOWED_CONTENT_TYPES: Record<string, Extension[]> = {
  // Images
  'image/jpeg': ['.jpg', '.jpeg'],
  'image/png': ['.png'],
  'image/gif': ['.gif'],
  'image/webp': ['.webp'],
  
  // Documents
  'application/pdf': ['.pdf'],
  'text/plain': ['.txt'],
  'text/markdown': ['.md'],
  
  // Code
  'text/javascript': ['.js', '.jsx'],
  'text/typescript': ['.ts', '.tsx'],
  'text/python': ['.py'],
  
  // Data
  'application/json': ['.json'],
  'text/csv': ['.csv'],
} as const;

export type AllowedContentType = keyof typeof ALLOWED_CONTENT_TYPES;

export interface AttachmentMetadata {
  name: string;
  size: number;
  contentType: string;
}

export interface ValidationResult {
  isValid: boolean;
  error?: string;
  sanitizedName?: string;
  contentType?: AllowedContentType;
}

// Maximum file size (10MB)
export const MAX_FILE_SIZE = 10 * 1024 * 1024; 