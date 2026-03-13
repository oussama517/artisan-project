import { writeFile, mkdir } from 'fs/promises';
import { existsSync } from 'fs';
import path from 'path';
import crypto from 'crypto';

const UPLOAD_DIR = process.env.UPLOAD_DIR || './public/uploads';
const MAX_FILE_SIZE = parseInt(process.env.MAX_FILE_SIZE || '5242880'); // 5MB
const ALLOWED_MIME_TYPES = (process.env.ALLOWED_MIME_TYPES || 'image/jpeg,image/png,image/webp,image/avif').split(',');

export interface UploadResult {
  success: boolean;
  url?: string;
  error?: string;
}

/**
 * Sanitize a filename to prevent path traversal and special characters
 */
function sanitizeFilename(filename: string): string {
  // Remove path separators and special chars
  const base = path.basename(filename);
  const ext = path.extname(base).toLowerCase();
  const name = path.basename(base, ext).replace(/[^a-zA-Z0-9_-]/g, '_');
  const hash = crypto.randomBytes(8).toString('hex');
  return `${name}_${hash}${ext}`;
}

/**
 * Validate and process a file upload from a base64-encoded payload
 */
export async function processUpload(
  fileData: string,
  mimeType: string,
  originalFilename: string,
  subfolder: string = 'general'
): Promise<UploadResult> {
  // Validate MIME type
  if (!ALLOWED_MIME_TYPES.includes(mimeType)) {
    return { success: false, error: `File type ${mimeType} is not allowed` };
  }

  // Decode and validate size
  const buffer = Buffer.from(fileData, 'base64');
  if (buffer.length > MAX_FILE_SIZE) {
    return { success: false, error: `File size exceeds ${MAX_FILE_SIZE / 1024 / 1024}MB limit` };
  }

  // Verify magic bytes match claimed MIME type
  if (!verifyMagicBytes(buffer, mimeType)) {
    return { success: false, error: 'File content does not match claimed type' };
  }

  // Ensure upload directory exists
  const uploadPath = path.join(UPLOAD_DIR, subfolder);
  if (!existsSync(uploadPath)) {
    await mkdir(uploadPath, { recursive: true });
  }

  // Save file
  const sanitizedName = sanitizeFilename(originalFilename);
  const filePath = path.join(uploadPath, sanitizedName);
  await writeFile(filePath, buffer);

  const url = `/uploads/${subfolder}/${sanitizedName}`;
  return { success: true, url };
}

/**
 * Basic magic byte verification to prevent MIME spoofing
 */
function verifyMagicBytes(buffer: Buffer, mimeType: string): boolean {
  const magicBytes: Record<string, number[][]> = {
    'image/jpeg': [[0xFF, 0xD8, 0xFF]],
    'image/png': [[0x89, 0x50, 0x4E, 0x47]],
    'image/webp': [[0x52, 0x49, 0x46, 0x46]], // RIFF header
    'image/avif': [], // AVIF detection is complex; skip for now
  };

  const expected = magicBytes[mimeType];
  if (!expected || expected.length === 0) return true; // Skip validation for complex formats

  return expected.some((magic) =>
    magic.every((byte, i) => buffer[i] === byte)
  );
}

/**
 * Process multiple file uploads (e.g., portfolio images)
 */
export async function processMultipleUploads(
  files: Array<{ data: string; mimeType: string; filename: string }>,
  subfolder: string,
  maxFiles: number = 10
): Promise<{ urls: string[]; errors: string[] }> {
  if (files.length > maxFiles) {
    return { urls: [], errors: [`Maximum ${maxFiles} files allowed`] };
  }

  const urls: string[] = [];
  const errors: string[] = [];

  for (const file of files) {
    const result = await processUpload(file.data, file.mimeType, file.filename, subfolder);
    if (result.success && result.url) {
      urls.push(result.url);
    } else {
      errors.push(result.error || 'Upload failed');
    }
  }

  return { urls, errors };
}
