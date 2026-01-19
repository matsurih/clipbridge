/**
 * Protocol utility functions
 */

import { v4 as uuidv4 } from 'uuid';
import { Message, MessageType, ClipboardItem, ClipboardDataType } from './types';

/**
 * Generate a unique device ID
 */
export function generateDeviceId(): string {
  return uuidv4();
}

/**
 * Generate a unique clipboard item ID
 */
export function generateClipboardItemId(): string {
  return uuidv4();
}

/**
 * Generate a random nonce for message authentication
 */
export function generateNonce(): string {
  return uuidv4();
}

/**
 * Create a protocol message
 */
export function createMessage<T>(
  type: MessageType,
  from: string,
  payload: T,
  to?: string | string[]
): Message<T> {
  return {
    type,
    from,
    to,
    payload,
    timestamp: Date.now(),
    nonce: generateNonce(),
  };
}

/**
 * Create a clipboard item
 */
export function createClipboardItem(
  deviceId: string,
  dataType: ClipboardDataType,
  content: Buffer | string,
  metadata: Partial<ClipboardItem['metadata']> = {}
): Omit<ClipboardItem, 'signature'> {
  const contentBuffer = typeof content === 'string' ? Buffer.from(content) : content;

  return {
    id: generateClipboardItemId(),
    deviceId,
    timestamp: Date.now(),
    dataType,
    content: {
      raw: contentBuffer,
      preview:
        dataType === ClipboardDataType.PLAIN_TEXT
          ? content.toString().substring(0, 100)
          : undefined,
      size: contentBuffer.length,
    },
    metadata: {
      encrypted: false,
      compressed: false,
      ...metadata,
    },
  };
}

/**
 * Check if clipboard data type is supported
 */
export function isSupportedDataType(mimeType: string): boolean {
  return Object.values(ClipboardDataType).includes(mimeType as ClipboardDataType);
}

/**
 * Get the most appropriate clipboard data type from MIME type
 */
export function getDataTypeFromMime(mimeType: string): ClipboardDataType | null {
  const normalizedMime = mimeType.toLowerCase();

  if (normalizedMime.includes('text/plain')) return ClipboardDataType.PLAIN_TEXT;
  if (normalizedMime.includes('text/html')) return ClipboardDataType.HTML;
  if (normalizedMime.includes('image/png')) return ClipboardDataType.IMAGE_PNG;
  if (normalizedMime.includes('image/jpeg') || normalizedMime.includes('image/jpg'))
    return ClipboardDataType.IMAGE_JPEG;

  return null;
}

/**
 * Format bytes to human-readable size
 */
export function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 Bytes';

  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
}

/**
 * Check if a timestamp is within a valid time window (to prevent replay attacks)
 */
export function isValidTimestamp(timestamp: number, maxAgeMs: number = 60000): boolean {
  const now = Date.now();
  const age = now - timestamp;
  return age >= 0 && age <= maxAgeMs;
}
