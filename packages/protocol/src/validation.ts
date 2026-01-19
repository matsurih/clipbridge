/**
 * Protocol validation functions
 */

import {
  Message,
  ClipboardItem,
  Device,
  AppConfig,
  MessageType,
  ClipboardDataType,
  Platform,
} from './types';

/**
 * Validate a protocol message
 */
export function validateMessage(msg: any): msg is Message {
  if (!msg || typeof msg !== 'object') return false;

  if (!Object.values(MessageType).includes(msg.type)) return false;
  if (typeof msg.from !== 'string' || !msg.from) return false;
  if (msg.to !== undefined && typeof msg.to !== 'string' && !Array.isArray(msg.to)) return false;
  if (typeof msg.timestamp !== 'number' || msg.timestamp <= 0) return false;
  if (typeof msg.nonce !== 'string' || !msg.nonce) return false;

  return true;
}

/**
 * Validate a clipboard item
 */
export function validateClipboardItem(item: any): item is ClipboardItem {
  if (!item || typeof item !== 'object') return false;

  if (typeof item.id !== 'string' || !item.id) return false;
  if (typeof item.deviceId !== 'string' || !item.deviceId) return false;
  if (typeof item.timestamp !== 'number' || item.timestamp <= 0) return false;
  if (!Object.values(ClipboardDataType).includes(item.dataType)) return false;

  // Validate content
  if (!item.content || typeof item.content !== 'object') return false;
  if (typeof item.content.size !== 'number' || item.content.size < 0) return false;

  // Validate metadata
  if (!item.metadata || typeof item.metadata !== 'object') return false;
  if (typeof item.metadata.encrypted !== 'boolean') return false;
  if (typeof item.metadata.compressed !== 'boolean') return false;

  if (typeof item.signature !== 'string') return false;

  return true;
}

/**
 * Validate device information
 */
export function validateDevice(device: any): device is Device {
  if (!device || typeof device !== 'object') return false;

  if (typeof device.id !== 'string' || !device.id) return false;
  if (typeof device.name !== 'string' || !device.name) return false;
  if (!Object.values(Platform).includes(device.platform)) return false;
  if (typeof device.publicKey !== 'string' || !device.publicKey) return false;
  if (typeof device.lastSeen !== 'number' || device.lastSeen <= 0) return false;

  // Validate capabilities
  if (!device.capabilities || typeof device.capabilities !== 'object') return false;
  if (typeof device.capabilities.supportsImages !== 'boolean') return false;
  if (typeof device.capabilities.supportsFiles !== 'boolean') return false;
  if (typeof device.capabilities.maxItemSize !== 'number' || device.capabilities.maxItemSize <= 0)
    return false;

  return true;
}

/**
 * Validate application configuration
 */
export function validateConfig(config: any): config is AppConfig {
  if (!config || typeof config !== 'object') return false;

  // Validate general settings
  if (!config.general || typeof config.general !== 'object') return false;
  if (typeof config.general.autoStart !== 'boolean') return false;
  if (typeof config.general.showNotifications !== 'boolean') return false;
  if (typeof config.general.historySize !== 'number' || config.general.historySize < 0)
    return false;

  // Validate sync settings
  if (!config.sync || typeof config.sync !== 'object') return false;
  if (!['p2p', 'cloud', 'hybrid'].includes(config.sync.mode)) return false;
  if (typeof config.sync.autoSync !== 'boolean') return false;
  if (typeof config.sync.syncImages !== 'boolean') return false;
  if (typeof config.sync.syncFiles !== 'boolean') return false;
  if (typeof config.sync.maxItemSize !== 'number' || config.sync.maxItemSize <= 0) return false;

  // Validate security settings
  if (!config.security || typeof config.security !== 'object') return false;
  if (typeof config.security.enableEncryption !== 'boolean') return false;
  if (typeof config.security.requireDeviceApproval !== 'boolean') return false;
  if (typeof config.security.enableSensitiveFilter !== 'boolean') return false;
  if (!Array.isArray(config.security.excludedApps)) return false;

  // Validate network settings
  if (!config.network || typeof config.network !== 'object') return false;
  if (typeof config.network.p2pPort !== 'number' || config.network.p2pPort <= 0) return false;
  if (typeof config.network.discoveryEnabled !== 'boolean') return false;

  return true;
}

/**
 * Validate if content contains potentially sensitive data
 */
export function containsSensitiveData(content: string): boolean {
  // Simple patterns for detecting passwords, credit cards, etc.
  const sensitivePatterns = [
    /password[:=\s]+[\w!@#$%^&*()]+/i,
    /\b\d{4}[\s-]?\d{4}[\s-]?\d{4}[\s-]?\d{4}\b/, // Credit card pattern
    /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/, // Email (optional)
    /api[_-]?key[:=\s]+[\w-]+/i,
    /secret[:=\s]+[\w-]+/i,
    /token[:=\s]+[\w-]+/i,
  ];

  return sensitivePatterns.some((pattern) => pattern.test(content));
}
