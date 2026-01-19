/**
 * ClipBridge Protocol Type Definitions
 */

/**
 * Supported clipboard data types
 */
export enum ClipboardDataType {
  PLAIN_TEXT = 'text/plain',
  HTML = 'text/html',
  IMAGE_PNG = 'image/png',
  IMAGE_JPEG = 'image/jpeg',
  FILE_PATHS = 'file/paths',
}

/**
 * Supported platforms
 */
export enum Platform {
  WINDOWS = 'windows',
  MACOS = 'macos',
  LINUX = 'linux',
  ANDROID = 'android',
  IOS = 'ios',
}

/**
 * Message types for communication protocol
 */
export enum MessageType {
  CLIPBOARD_UPDATE = 'clipboard_update',
  DEVICE_HELLO = 'device_hello',
  DEVICE_ACK = 'device_ack',
  DEVICE_GOODBYE = 'device_goodbye',
  HISTORY_REQUEST = 'history_request',
  HISTORY_RESPONSE = 'history_response',
  PING = 'ping',
  PONG = 'pong',
}

/**
 * Clipboard item metadata
 */
export interface ClipboardMetadata {
  appName?: string;
  appBundleId?: string;
  encrypted: boolean;
  compressed: boolean;
}

/**
 * Clipboard content data
 */
export interface ClipboardContent {
  raw: Buffer | string;
  preview?: string;
  size: number;
}

/**
 * Complete clipboard item structure
 */
export interface ClipboardItem {
  id: string;
  deviceId: string;
  timestamp: number;
  dataType: ClipboardDataType;
  content: ClipboardContent;
  metadata: ClipboardMetadata;
  signature: string;
}

/**
 * Device capabilities
 */
export interface DeviceCapabilities {
  supportsImages: boolean;
  supportsFiles: boolean;
  maxItemSize: number;
}

/**
 * Device information
 */
export interface Device {
  id: string;
  name: string;
  platform: Platform;
  publicKey: string;
  lastSeen: number;
  capabilities: DeviceCapabilities;
}

/**
 * Protocol message structure
 */
export interface Message<T = any> {
  type: MessageType;
  from: string;
  to?: string | string[];
  payload: T;
  timestamp: number;
  nonce: string;
}

/**
 * Sync mode options
 */
export type SyncMode = 'p2p' | 'cloud' | 'hybrid';

/**
 * Application configuration
 */
export interface AppConfig {
  general: {
    autoStart: boolean;
    showNotifications: boolean;
    historySize: number;
  };
  sync: {
    mode: SyncMode;
    autoSync: boolean;
    syncImages: boolean;
    syncFiles: boolean;
    maxItemSize: number;
  };
  security: {
    enableEncryption: boolean;
    requireDeviceApproval: boolean;
    enableSensitiveFilter: boolean;
    excludedApps: string[];
  };
  network: {
    relayServerUrl?: string;
    p2pPort: number;
    discoveryEnabled: boolean;
  };
}

/**
 * Default configuration values
 */
export const DEFAULT_CONFIG: AppConfig = {
  general: {
    autoStart: true,
    showNotifications: true,
    historySize: 100,
  },
  sync: {
    mode: 'p2p',
    autoSync: true,
    syncImages: true,
    syncFiles: false,
    maxItemSize: 10 * 1024 * 1024, // 10MB
  },
  security: {
    enableEncryption: true,
    requireDeviceApproval: true,
    enableSensitiveFilter: true,
    excludedApps: [],
  },
  network: {
    p2pPort: 7878,
    discoveryEnabled: true,
  },
};
