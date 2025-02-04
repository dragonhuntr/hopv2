import { 
  ALLOWED_CONTENT_TYPES, 
  AllowedContentType,
  Extension,
  AttachmentMetadata, 
  ValidationResult,
  MAX_FILE_SIZE 
} from '../types/attachment';

/**
 * Sanitizes a filename by removing special characters and limiting length
 */
const sanitizeFileName = (fileName: string): string => {
  // Remove any path traversal attempts and special characters
  const sanitized = fileName
    .replace(/[^a-zA-Z0-9.-]/g, '_')  // Replace special chars with underscore
    .replace(/\.{2,}/g, '.')          // Remove consecutive dots
    .slice(0, 255);                   // Limit length to 255 chars

  return sanitized;
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
): { isValid: boolean; contentType?: AllowedContentType } => {
  const extension = getFileExtension(fileName);
  const normalizedContentType = contentType.toLowerCase();

  // Check if content type is allowed
  if (!(normalizedContentType in ALLOWED_CONTENT_TYPES)) {
    return { isValid: false };
  }

  const allowedContentType = normalizedContentType as AllowedContentType;
  const allowedExtensions = ALLOWED_CONTENT_TYPES[allowedContentType];

  // Type check the extension
  if (!allowedExtensions?.includes(extension as Extension)) {
    return { isValid: false };
  }

  return { 
    isValid: true, 
    contentType: allowedContentType 
  };
};

/**
 * Validates an attachment based on its metadata
 */
export const validateAttachment = (
  metadata: AttachmentMetadata
): ValidationResult => {
  // Validate file size
  if (metadata.size > MAX_FILE_SIZE) {
    return {
      isValid: false,
      error: `File size exceeds maximum allowed size of ${MAX_FILE_SIZE / (1024 * 1024)}MB`,
      sanitizedName: sanitizeFileName(metadata.name)
    };
  }

  // Sanitize filename
  const sanitizedName = sanitizeFileName(metadata.name);

  // Validate content type
  const contentTypeValidation = validateContentType(
    metadata.contentType,
    metadata.name
  );

  if (!contentTypeValidation.isValid) {
    return {
      isValid: false,
      error: 'Invalid content type or file extension mismatch',
      sanitizedName
    };
  }

  return {
    isValid: true,
    sanitizedName,
    contentType: contentTypeValidation.contentType
  };
};

/**
 * Type guard to check if a content type is allowed
 */
export const isAllowedContentType = (
  contentType: string
): contentType is AllowedContentType => {
  return contentType.toLowerCase() in ALLOWED_CONTENT_TYPES;
}; 