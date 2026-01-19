/**
 * ClipBridge Sync Engine
 * Core synchronization logic for clipboard items
 */

import EventEmitter from 'eventemitter3';
import {
  ClipboardItem,
  Device,
  Message,
  MessageType,
  createMessage,
  validateClipboardItem,
  validateMessage,
} from '@clipbridge/protocol';

export interface SyncEngineEvents {
  itemReceived: (item: ClipboardItem) => void;
  itemSent: (item: ClipboardItem) => void;
  deviceConnected: (device: Device) => void;
  deviceDisconnected: (device: Device) => void;
  error: (error: Error) => void;
  syncStateChanged: (state: SyncState) => void;
}

export enum SyncState {
  IDLE = 'idle',
  SYNCING = 'syncing',
  ERROR = 'error',
  PAUSED = 'paused',
}

export class SyncEngine extends EventEmitter<SyncEngineEvents> {
  private deviceId: string;
  private connectedDevices: Map<string, Device> = new Map();
  private recentItems: Map<string, ClipboardItem> = new Map();
  private state: SyncState = SyncState.IDLE;
  private isPaused: boolean = false;

  constructor(deviceId: string) {
    super();
    this.deviceId = deviceId;
  }

  /**
   * Get current sync state
   */
  getState(): SyncState {
    return this.state;
  }

  /**
   * Set sync state
   */
  private setState(state: SyncState): void {
    if (this.state !== state) {
      this.state = state;
      this.emit('syncStateChanged', state);
    }
  }

  /**
   * Pause synchronization
   */
  pause(): void {
    this.isPaused = true;
    this.setState(SyncState.PAUSED);
  }

  /**
   * Resume synchronization
   */
  resume(): void {
    this.isPaused = false;
    this.setState(SyncState.IDLE);
  }

  /**
   * Check if sync is paused
   */
  isPausedState(): boolean {
    return this.isPaused;
  }

  /**
   * Register a connected device
   */
  registerDevice(device: Device): void {
    this.connectedDevices.set(device.id, device);
    this.emit('deviceConnected', device);
  }

  /**
   * Unregister a device
   */
  unregisterDevice(deviceId: string): void {
    const device = this.connectedDevices.get(deviceId);
    if (device) {
      this.connectedDevices.delete(deviceId);
      this.emit('deviceDisconnected', device);
    }
  }

  /**
   * Get all connected devices
   */
  getConnectedDevices(): Device[] {
    return Array.from(this.connectedDevices.values());
  }

  /**
   * Get device by ID
   */
  getDevice(deviceId: string): Device | undefined {
    return this.connectedDevices.get(deviceId);
  }

  /**
   * Process an incoming clipboard item
   */
  async processIncomingItem(item: ClipboardItem): Promise<void> {
    if (this.isPaused) {
      return;
    }

    if (!validateClipboardItem(item)) {
      this.emit('error', new Error('Invalid clipboard item received'));
      return;
    }

    // Check if we've already processed this item (deduplication)
    if (this.recentItems.has(item.id)) {
      return;
    }

    // Check if the item is from a known device
    if (!this.connectedDevices.has(item.deviceId)) {
      this.emit('error', new Error(`Unknown device: ${item.deviceId}`));
      return;
    }

    try {
      this.setState(SyncState.SYNCING);

      // Store in recent items cache
      this.recentItems.set(item.id, item);

      // Emit event for clipboard manager to handle
      this.emit('itemReceived', item);

      this.setState(SyncState.IDLE);
    } catch (error) {
      this.setState(SyncState.ERROR);
      this.emit('error', error as Error);
    }
  }

  /**
   * Send a clipboard item to connected devices
   */
  async sendItem(item: Omit<ClipboardItem, 'deviceId'>): Promise<void> {
    if (this.isPaused) {
      return;
    }

    try {
      this.setState(SyncState.SYNCING);

      const fullItem: ClipboardItem = {
        ...item,
        deviceId: this.deviceId,
      };

      // Store in recent items cache
      this.recentItems.set(fullItem.id, fullItem);

      // Emit event for network layer to handle actual transmission
      this.emit('itemSent', fullItem);

      this.setState(SyncState.IDLE);
    } catch (error) {
      this.setState(SyncState.ERROR);
      this.emit('error', error as Error);
    }
  }

  /**
   * Process an incoming protocol message
   */
  async processMessage(message: Message): Promise<void> {
    if (!validateMessage(message)) {
      this.emit('error', new Error('Invalid message received'));
      return;
    }

    switch (message.type) {
      case MessageType.CLIPBOARD_UPDATE:
        await this.processIncomingItem(message.payload as ClipboardItem);
        break;

      case MessageType.DEVICE_HELLO:
        // Device discovery/connection logic would go here
        break;

      case MessageType.DEVICE_GOODBYE:
        this.unregisterDevice(message.from);
        break;

      case MessageType.PING:
        // Respond with PONG (handled by network layer)
        break;

      default:
        // Unknown message type
        break;
    }
  }

  /**
   * Create a message for sending a clipboard update
   */
  createClipboardUpdateMessage(item: ClipboardItem): Message<ClipboardItem> {
    return createMessage(MessageType.CLIPBOARD_UPDATE, this.deviceId, item);
  }

  /**
   * Clean up old items from the cache
   */
  cleanupCache(maxAge: number = 60000): void {
    const now = Date.now();
    for (const [id, item] of this.recentItems.entries()) {
      if (now - item.timestamp > maxAge) {
        this.recentItems.delete(id);
      }
    }
  }

  /**
   * Get recent items
   */
  getRecentItems(): ClipboardItem[] {
    return Array.from(this.recentItems.values());
  }

  /**
   * Clear all caches and reset state
   */
  reset(): void {
    this.recentItems.clear();
    this.connectedDevices.clear();
    this.setState(SyncState.IDLE);
  }
}
