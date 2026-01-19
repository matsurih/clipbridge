/**
 * ClipBridge Clipboard Manager
 * Abstract base class for platform-specific clipboard implementations
 */

import EventEmitter from 'eventemitter3';
import { ClipboardItem, ClipboardDataType } from '@clipbridge/protocol';

export interface ClipboardManagerEvents {
  change: (item: ClipboardItem) => void;
  error: (error: Error) => void;
}

export interface ClipboardData {
  type: ClipboardDataType;
  content: Buffer | string;
}

/**
 * Abstract clipboard manager
 * Platform-specific implementations should extend this class
 */
export abstract class ClipboardManager extends EventEmitter<ClipboardManagerEvents> {
  protected isMonitoring: boolean = false;
  protected lastClipboardHash: string | null = null;

  /**
   * Start monitoring clipboard changes
   */
  abstract startMonitoring(): Promise<void>;

  /**
   * Stop monitoring clipboard changes
   */
  abstract stopMonitoring(): void;

  /**
   * Read current clipboard content
   */
  abstract readClipboard(): Promise<ClipboardData | null>;

  /**
   * Write content to clipboard
   */
  abstract writeClipboard(data: ClipboardData): Promise<void>;

  /**
   * Get available clipboard formats
   */
  abstract getAvailableFormats(): Promise<ClipboardDataType[]>;

  /**
   * Check if clipboard manager is monitoring
   */
  isActive(): boolean {
    return this.isMonitoring;
  }

  /**
   * Generate a simple hash for clipboard content
   * Used for deduplication
   */
  protected generateHash(content: Buffer | string): string {
    const str = typeof content === 'string' ? content : content.toString('base64');
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = (hash << 5) - hash + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return hash.toString(36);
  }

  /**
   * Check if clipboard content has changed
   */
  protected hasChanged(content: Buffer | string): boolean {
    const currentHash = this.generateHash(content);
    if (currentHash === this.lastClipboardHash) {
      return false;
    }
    this.lastClipboardHash = currentHash;
    return true;
  }
}
