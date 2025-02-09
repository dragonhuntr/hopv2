import { 
  ContentType,
  Extension,
  AttachmentMetadata, 
  ValidationResult,
  EXTENSION_MAP,
  MAX_FILE_SIZE 
} from '@/types/attachment';

/**
 * Sanitizes a filename by removing special characters and limiting length
 */
const sanitizeFileName = (fileName: string): string => {
  return fileName
    .replace(/[^a-zA-Z0-9.-]/g, '_')
    .replace(/\.{2,}/g, '.')
    .slice(0, 255);
};

/**
 * Gets the file extension from a filename
 */
const getFileExtension = (fileName: string): string => {
  const ext = fileName.toLowerCase().split('.').pop();
  return ext ? `.${ext}` : '';
};

/**
 * Validates if a content type is allowed and matches the file extension
 */
const validateContentType = (
  contentType: string, 
  fileName: string
): { isValid: boolean; contentType?: ContentType } => {
  const extension = getFileExtension(fileName);
  const normalizedContentType = contentType.toLowerCase() as ContentType;

  // Check if content type is allowed and extensions match
  if (!(normalizedContentType in EXTENSION_MAP)) {
    return { isValid: false };
  }

  const allowedExtensions = EXTENSION_MAP[normalizedContentType];
  if (!allowedExtensions.includes(extension as Extension)) {
    return { isValid: false };
  }

  return { 
    isValid: true, 
    contentType: normalizedContentType 
  };
};

/**
 * Validates an attachment based on its metadata
 */
export const validateAttachment = (
  metadata: AttachmentMetadata
): ValidationResult => {
  const sanitizedName = sanitizeFileName(metadata.name);

  if (metadata.size > MAX_FILE_SIZE) {
    return {
      isValid: false,
      error: `File size exceeds maximum allowed size of ${MAX_FILE_SIZE / (1024 * 1024)}MB`,
      sanitizedName
    };
  }

  const { isValid, contentType } = validateContentType(
    metadata.contentType,
    metadata.name
  );

  if (!isValid) {
    return {
      isValid: false,
      error: 'Invalid content type or file extension mismatch',
      sanitizedName
    };
  }

  return {
    isValid: true,
    sanitizedName,
    contentType
  };
};

/**
 * Type guard to check if a content type is allowed
 */
export const isValidContentType = (
  contentType: string
): contentType is ContentType => {
  return contentType.toLowerCase() in EXTENSION_MAP;
}; 