/**
 * ClipBridge Storage Layer
 * Handles persistent storage of clipboard history and configuration
 */

import { ClipboardItem, AppConfig, Device, DEFAULT_CONFIG } from '@clipbridge/protocol';

export interface StorageAdapter {
  /**
   * Initialize storage
   */
  init(): Promise<void>;

  /**
   * Save clipboard item to history
   */
  saveClipboardItem(item: ClipboardItem): Promise<void>;

  /**
   * Get clipboard history
   */
  getHistory(limit?: number): Promise<ClipboardItem[]>;

  /**
   * Clear clipboard history
   */
  clearHistory(): Promise<void>;

  /**
   * Save configuration
   */
  saveConfig(config: AppConfig): Promise<void>;

  /**
   * Load configuration
   */
  loadConfig(): Promise<AppConfig>;

  /**
   * Save device information
   */
  saveDevice(device: Device): Promise<void>;

  /**
   * Get all known devices
   */
  getDevices(): Promise<Device[]>;

  /**
   * Remove device
   */
  removeDevice(deviceId: string): Promise<void>;

  /**
   * Close storage connection
   */
  close(): Promise<void>;
}

/**
 * In-memory storage implementation for development/testing
 */
export class MemoryStorage implements StorageAdapter {
  private history: ClipboardItem[] = [];
  private config: AppConfig = DEFAULT_CONFIG;
  private devices: Map<string, Device> = new Map();

  async init(): Promise<void> {
    // No initialization needed for memory storage
  }

  async saveClipboardItem(item: ClipboardItem): Promise<void> {
    this.history.unshift(item);
    // Limit history size
    if (this.history.length > this.config.general.historySize) {
      this.history = this.history.slice(0, this.config.general.historySize);
    }
  }

  async getHistory(limit?: number): Promise<ClipboardItem[]> {
    if (limit) {
      return this.history.slice(0, limit);
    }
    return [...this.history];
  }

  async clearHistory(): Promise<void> {
    this.history = [];
  }

  async saveConfig(config: AppConfig): Promise<void> {
    this.config = { ...config };
  }

  async loadConfig(): Promise<AppConfig> {
    return { ...this.config };
  }

  async saveDevice(device: Device): Promise<void> {
    this.devices.set(device.id, device);
  }

  async getDevices(): Promise<Device[]> {
    return Array.from(this.devices.values());
  }

  async removeDevice(deviceId: string): Promise<void> {
    this.devices.delete(deviceId);
  }

  async close(): Promise<void> {
    // No cleanup needed for memory storage
  }
}

/**
 * Storage manager with caching
 */
export class StorageManager {
  private adapter: StorageAdapter;
  private configCache: AppConfig | null = null;

  constructor(adapter: StorageAdapter) {
    this.adapter = adapter;
  }

  async init(): Promise<void> {
    await this.adapter.init();
    this.configCache = await this.adapter.loadConfig();
  }

  async saveClipboardItem(item: ClipboardItem): Promise<void> {
    await this.adapter.saveClipboardItem(item);
  }

  async getHistory(limit?: number): Promise<ClipboardItem[]> {
    return this.adapter.getHistory(limit);
  }

  async clearHistory(): Promise<void> {
    await this.adapter.clearHistory();
  }

  async getConfig(): Promise<AppConfig> {
    if (!this.configCache) {
      this.configCache = await this.adapter.loadConfig();
    }
    return this.configCache;
  }

  async updateConfig(config: Partial<AppConfig>): Promise<void> {
    const currentConfig = await this.getConfig();
    const newConfig: AppConfig = {
      general: { ...currentConfig.general, ...config.general },
      sync: { ...currentConfig.sync, ...config.sync },
      security: { ...currentConfig.security, ...config.security },
      network: { ...currentConfig.network, ...config.network },
    };
    await this.adapter.saveConfig(newConfig);
    this.configCache = newConfig;
  }

  async saveDevice(device: Device): Promise<void> {
    await this.adapter.saveDevice(device);
  }

  async getDevices(): Promise<Device[]> {
    return this.adapter.getDevices();
  }

  async removeDevice(deviceId: string): Promise<void> {
    await this.adapter.removeDevice(deviceId);
  }

  async close(): Promise<void> {
    await this.adapter.close();
  }
}
