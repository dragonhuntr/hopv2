// Define allowed extensions
export type Extension = '.jpg' | '.jpeg' | '.png' | '.gif' | '.webp' | '.pdf' | '.txt' | '.md' | '.js' | '.jsx' | '.ts' | '.tsx' | '.py' | '.json' | '.csv';

export type AttachmentStatus = 'pending' | 'active' | 'deleted';

// Define content types directly
export type ContentType = 
  | 'image/jpeg' 
  | 'image/png'
  | 'image/gif'
  | 'image/webp'
  | 'application/pdf'
  | 'text/plain'
  | 'text/markdown'
  | 'text/javascript'
  | 'text/typescript'
  | 'text/python'
  | 'application/json'
  | 'text/csv';

// Simple mapping for validation
export const EXTENSION_MAP: Record<ContentType, Extension[]> = {
  'image/jpeg': ['.jpg', '.jpeg'],
  'image/png': ['.png'],
  'image/gif': ['.gif'],
  'image/webp': ['.webp'],
  'application/pdf': ['.pdf'],
  'text/plain': ['.txt'],
  'text/markdown': ['.md'],
  'text/javascript': ['.js', '.jsx'],
  'text/typescript': ['.ts', '.tsx'],
  'text/python': ['.py'],
  'application/json': ['.json'],
  'text/csv': ['.csv']
} as const;

export interface AttachmentMetadata {
  name: string;
  size: number;
  contentType: string;
}

export interface ValidationResult {
  isValid: boolean;
  error?: string;
  sanitizedName?: string;
  contentType?: ContentType;
}

export interface Attachment {
  id: string;
  url: string;
  name: string;
  contentType: string;
}

// Maximum file size (10MB)
export const MAX_FILE_SIZE = 10 * 1024 * 1024; 