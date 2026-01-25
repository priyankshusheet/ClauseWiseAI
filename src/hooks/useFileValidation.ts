import { useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';

export interface FileValidationResult {
  isValid: boolean;
  error: string | null;
  warnings: string[];
}

interface FileValidationOptions {
  maxSizeMB?: number;
  allowedTypes?: string[];
  allowedExtensions?: string[];
}

const DEFAULT_OPTIONS: FileValidationOptions = {
  maxSizeMB: 10,
  allowedTypes: [
    'application/pdf',
    'text/plain',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'image/jpeg',
    'image/png',
    'image/webp',
  ],
  allowedExtensions: ['.pdf', '.txt', '.doc', '.docx', '.jpg', '.jpeg', '.png', '.webp'],
};

// Basic file signature validation (magic bytes)
const FILE_SIGNATURES: Record<string, number[]> = {
  pdf: [0x25, 0x50, 0x44, 0x46], // %PDF
  png: [0x89, 0x50, 0x4E, 0x47], // PNG
  jpg: [0xFF, 0xD8, 0xFF], // JPEG
  gif: [0x47, 0x49, 0x46], // GIF
  zip: [0x50, 0x4B, 0x03, 0x04], // ZIP (also DOCX)
};

export const useFileValidation = (options: FileValidationOptions = {}) => {
  const { toast } = useToast();
  const config = { ...DEFAULT_OPTIONS, ...options };

  const validateFileSignature = useCallback(async (file: File): Promise<boolean> => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        const arr = new Uint8Array(reader.result as ArrayBuffer);
        const header = Array.from(arr.slice(0, 8));

        // Check for known file signatures
        const isPDF = FILE_SIGNATURES.pdf.every((byte, i) => header[i] === byte);
        const isPNG = FILE_SIGNATURES.png.every((byte, i) => header[i] === byte);
        const isJPG = FILE_SIGNATURES.jpg.every((byte, i) => header[i] === byte);
        const isZIP = FILE_SIGNATURES.zip.every((byte, i) => header[i] === byte); // DOCX is ZIP
        
        // Text files don't have magic bytes, so we check if it's printable text
        const isTextLike = arr.slice(0, 100).every(byte => 
          byte === 0x09 || byte === 0x0A || byte === 0x0D || (byte >= 0x20 && byte <= 0x7E)
        );

        resolve(isPDF || isPNG || isJPG || isZIP || isTextLike);
      };
      reader.onerror = () => resolve(false);
      reader.readAsArrayBuffer(file.slice(0, 8));
    });
  }, []);

  const validateFile = useCallback(async (file: File): Promise<FileValidationResult> => {
    const warnings: string[] = [];
    
    // Check file size
    const fileSizeMB = file.size / (1024 * 1024);
    if (config.maxSizeMB && fileSizeMB > config.maxSizeMB) {
      return {
        isValid: false,
        error: `File size (${fileSizeMB.toFixed(2)}MB) exceeds maximum allowed size (${config.maxSizeMB}MB)`,
        warnings,
      };
    }

    // Check file type
    const extension = '.' + file.name.split('.').pop()?.toLowerCase();
    const isValidType = config.allowedTypes?.includes(file.type) || false;
    const isValidExtension = config.allowedExtensions?.includes(extension) || false;

    if (!isValidType && !isValidExtension) {
      return {
        isValid: false,
        error: `Unsupported file format. Allowed: ${config.allowedExtensions?.join(', ')}`,
        warnings,
      };
    }

    // Validate file signature (basic malware check)
    const hasValidSignature = await validateFileSignature(file);
    if (!hasValidSignature) {
      return {
        isValid: false,
        error: 'File appears to be corrupted or has an invalid format',
        warnings,
      };
    }

    // Check for potentially dangerous file names
    const dangerousPatterns = [
      /\.exe$/i,
      /\.dll$/i,
      /\.bat$/i,
      /\.cmd$/i,
      /\.msi$/i,
      /\.js$/i,
      /\.vbs$/i,
      /\.ps1$/i,
    ];

    if (dangerousPatterns.some(pattern => pattern.test(file.name))) {
      return {
        isValid: false,
        error: 'This file type is not allowed for security reasons',
        warnings,
      };
    }

    // Warnings for edge cases
    if (fileSizeMB > config.maxSizeMB! * 0.8) {
      warnings.push('This is a large file and may take longer to process');
    }

    if (file.name.includes(' ')) {
      warnings.push('File name contains spaces, which may cause issues in some systems');
    }

    return {
      isValid: true,
      error: null,
      warnings,
    };
  }, [config, validateFileSignature]);

  const validateWithToast = useCallback(async (file: File): Promise<boolean> => {
    const result = await validateFile(file);

    if (!result.isValid) {
      toast({
        title: 'Invalid file',
        description: result.error || 'The file could not be validated',
        variant: 'destructive',
      });
      return false;
    }

    if (result.warnings.length > 0) {
      toast({
        title: 'File accepted with warnings',
        description: result.warnings.join('. '),
      });
    }

    return true;
  }, [validateFile, toast]);

  return {
    validateFile,
    validateWithToast,
    maxSizeMB: config.maxSizeMB,
    allowedExtensions: config.allowedExtensions,
  };
};

export default useFileValidation;
