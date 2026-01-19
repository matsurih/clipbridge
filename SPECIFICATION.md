# ClipBridge - クリップボード同期システム仕様書

## 1. プロジェクト概要

ClipBridgeは、Windows、macOS、Ubuntu、Android、iOS間でクリップボードの内容をリアルタイムに同期するクロスプラットフォームアプリケーションです。

## 2. 主要機能

### 2.1 コア機能
- **リアルタイムクリップボード同期**: あるデバイスでコピーした内容が、接続されている全てのデバイスのクリップボードに即座に反映される
- **複数デバイス対応**: 無制限のデバイスを同一ネットワークまたはクラウド経由で接続可能
- **データ形式のサポート**:
  - プレーンテキスト
  - リッチテキスト（HTML）
  - 画像（PNG、JPEG、GIF）
  - ファイルパス/URI
- **クリップボード履歴**: 過去のクリップボード内容を保存・参照（最大100件）
- **選択的同期**: 特定のデバイス間のみで同期する設定が可能

### 2.2 セキュリティ機能
- **エンドツーエンド暗号化**: AES-256による通信の暗号化
- **デバイス認証**: 公開鍵暗号方式によるデバイス間の相互認証
- **センシティブデータフィルタ**: パスワードやクレジットカード番号などの自動検出と同期除外オプション

### 2.3 ユーザビリティ機能
- **自動起動**: OS起動時に自動的にバックグラウンドで起動
- **システムトレイ/通知エリア統合**: 最小化時もトレイから操作可能
- **同期通知**: 同期発生時の視覚的フィードバック（オプション）
- **一時停止機能**: 同期を一時的に停止する機能

## 3. システムアーキテクチャ

### 3.1 アーキテクチャパターン
ClipBridgeは以下の2つの動作モードをサポート:

#### モード1: P2P（ピアツーピア）モード
- ローカルネットワーク内でデバイス間が直接通信
- mDNS/Bonjourによるデバイス自動検出
- 低レイテンシ、インターネット接続不要

#### モード2: クラウドリレーモード
- 中継サーバーを経由してデバイス間で通信
- 異なるネットワーク間でも同期可能
- WebSocketまたはHTTP/2ロングポーリングを使用

### 3.2 コンポーネント構成

```
┌─────────────────────────────────────────────────────────┐
│                    ClipBridge Client                     │
├─────────────────────────────────────────────────────────┤
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  │
│  │ Clipboard    │  │   UI Layer   │  │  Settings    │  │
│  │ Monitor      │  │  (Tray/GUI)  │  │  Manager     │  │
│  └──────┬───────┘  └──────────────┘  └──────────────┘  │
│         │                                                │
│  ┌──────▼──────────────────────────────────────────┐   │
│  │         Sync Engine (Core Logic)                │   │
│  │  - Change Detection                             │   │
│  │  - Conflict Resolution                          │   │
│  │  - Data Serialization                           │   │
│  └──────┬──────────────────────────────────────────┘   │
│         │                                                │
│  ┌──────▼──────────────────────────────────────────┐   │
│  │         Crypto Layer                            │   │
│  │  - Encryption/Decryption (AES-256)              │   │
│  │  - Key Exchange (ECDH)                          │   │
│  └──────┬──────────────────────────────────────────┘   │
│         │                                                │
│  ┌──────▼──────────────────────────────────────────┐   │
│  │         Network Layer                           │   │
│  │  - P2P Discovery (mDNS)                         │   │
│  │  - WebSocket Client                             │   │
│  │  - Protocol Handler                             │   │
│  └──────┬──────────────────────────────────────────┘   │
│         │                                                │
│  ┌──────▼──────────────────────────────────────────┐   │
│  │         Storage Layer                           │   │
│  │  - History Database (SQLite)                    │   │
│  │  - Configuration Storage                        │   │
│  └─────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────┘
                         │
                         ▼
         ┌───────────────────────────────┐
         │   ClipBridge Relay Server     │
         │   (Optional, for Cloud Mode)  │
         │  - WebSocket Server           │
         │  - Device Registry            │
         │  - Message Routing            │
         └───────────────────────────────┘
```

## 4. 技術スタック

### 4.1 デスクトップアプリケーション（Windows/macOS/Ubuntu）
- **フレームワーク**: Electron または Tauri
- **言語**: TypeScript/Rust
- **クリップボードAPI**:
  - Windows: Win32 API (Clipboard)
  - macOS: NSPasteboard
  - Linux: X11/Wayland (xclip, wl-clipboard)
- **P2P通信**: WebRTC または カスタムTCP/UDP
- **暗号化**: crypto (Node.js) または ring (Rust)

### 4.2 モバイルアプリケーション（Android/iOS）
- **フレームワーク**: React Native または Flutter
- **言語**: TypeScript/Dart
- **クリップボードAPI**:
  - Android: ClipboardManager
  - iOS: UIPasteboard
- **バックグラウンド処理**:
  - Android: Foreground Service
  - iOS: Background App Refresh (制限あり)

### 4.3 リレーサーバー
- **言語**: Node.js (TypeScript) または Rust
- **フレームワーク**: Socket.io / ws または tokio + tungstenite
- **データベース**: Redis (セッション管理), PostgreSQL (ユーザー管理、オプション)
- **デプロイ**: Docker + Kubernetes または Fly.io

### 4.4 共通ライブラリ
- **プロトコル**: Protocol Buffers または MessagePack
- **暗号化**: libsodium (統一した暗号化ライブラリ)

## 5. データモデル

### 5.1 クリップボードアイテム

```typescript
interface ClipboardItem {
  id: string;                    // UUID
  deviceId: string;              // 送信元デバイスID
  timestamp: number;             // Unix timestamp (ms)
  dataType: ClipboardDataType;   // データ形式
  content: ClipboardContent;     // 実際のコンテンツ
  metadata: ClipboardMetadata;   // メタデータ
  signature: string;             // 改ざん検知用署名
}

enum ClipboardDataType {
  PLAIN_TEXT = 'text/plain',
  HTML = 'text/html',
  IMAGE_PNG = 'image/png',
  IMAGE_JPEG = 'image/jpeg',
  FILE_PATHS = 'file/paths'
}

interface ClipboardContent {
  raw: Buffer | string;          // 暗号化された実データ
  preview?: string;              // プレビュー用テキスト（最大100文字）
  size: number;                  // バイトサイズ
}

interface ClipboardMetadata {
  appName?: string;              // コピー元アプリケーション名
  appBundleId?: string;          // アプリケーションID
  encrypted: boolean;            // 暗号化されているか
  compressed: boolean;           // 圧縮されているか
}
```

### 5.2 デバイス情報

```typescript
interface Device {
  id: string;                    // デバイス固有ID
  name: string;                  // ユーザー定義名
  platform: Platform;            // OS種別
  publicKey: string;             // 公開鍵
  lastSeen: number;              // 最終接続時刻
  capabilities: DeviceCapabilities;
}

enum Platform {
  WINDOWS = 'windows',
  MACOS = 'macos',
  LINUX = 'linux',
  ANDROID = 'android',
  IOS = 'ios'
}

interface DeviceCapabilities {
  supportsImages: boolean;
  supportsFiles: boolean;
  maxItemSize: number;           // 最大アイテムサイズ（バイト）
}
```

## 6. 通信プロトコル

### 6.1 メッセージフォーマット

全てのメッセージはProtocol Buffersまたは以下のJSON形式を使用:

```typescript
interface Message {
  type: MessageType;
  from: string;                  // 送信元デバイスID
  to?: string | string[];        // 宛先デバイスID（省略時は全デバイス）
  payload: any;                  // メッセージペイロード
  timestamp: number;
  nonce: string;                 // リプレイ攻撃防止
}

enum MessageType {
  CLIPBOARD_UPDATE = 'clipboard_update',
  DEVICE_HELLO = 'device_hello',
  DEVICE_ACK = 'device_ack',
  DEVICE_GOODBYE = 'device_goodbye',
  HISTORY_REQUEST = 'history_request',
  HISTORY_RESPONSE = 'history_response',
  PING = 'ping',
  PONG = 'pong'
}
```

### 6.2 通信フロー

#### デバイス接続フロー（P2Pモード）
1. デバイスAがmDNSで他のデバイスを検出
2. デバイスAがデバイスBにTCP接続
3. DEVICE_HELLOメッセージを交換（公開鍵含む）
4. ECDH鍵交換で共有鍵を生成
5. DEVICE_ACKで接続確立
6. 以降、全ての通信は共有鍵で暗号化

#### クリップボード同期フロー
1. デバイスAでクリップボード変更を検知
2. ClipboardItemオブジェクトを生成
3. コンテンツを暗号化
4. CLIPBOARD_UPDATEメッセージを他のデバイスに送信
5. 受信側デバイスは復号化してクリップボードに反映

## 7. セキュリティ設計

### 7.1 暗号化方式
- **通信の暗号化**: TLS 1.3 (クラウドモード), AES-256-GCM (P2Pモード)
- **データの暗号化**: AES-256-GCM (クリップボードコンテンツ)
- **鍵交換**: ECDH (Curve25519)
- **デバイス認証**: Ed25519署名

### 7.2 鍵管理
- 各デバイスは起動時にEd25519鍵ペアを生成（または保存済みのものを読み込み）
- 初回ペアリング時に公開鍵を交換
- セッション鍵はECDHで生成し、定期的にローテーション（1時間ごと）

### 7.3 セキュリティ機能
- **デバイス承認制**: 新しいデバイスは手動で承認が必要
- **センシティブデータフィルタ**: 正規表現ベースでパスワードパターンを検出
- **同期除外設定**: 特定のアプリケーションからのコピーを除外可能

## 8. パフォーマンス要件

- **同期レイテンシ**: P2Pモードで100ms以下、クラウドモードで500ms以下
- **最大アイテムサイズ**: 10MB（画像など）
- **履歴保存数**: デフォルト100件、最大1000件
- **メモリ使用量**: デスクトップで50MB以下、モバイルで30MB以下
- **CPU使用率**: アイドル時1%以下

## 9. 設定項目

```typescript
interface AppConfig {
  general: {
    autoStart: boolean;              // 自動起動
    showNotifications: boolean;      // 通知表示
    historySize: number;             // 履歴保存数
  };
  sync: {
    mode: 'p2p' | 'cloud' | 'hybrid';
    autoSync: boolean;               // 自動同期
    syncImages: boolean;             // 画像の同期
    syncFiles: boolean;              // ファイルの同期
    maxItemSize: number;             // 最大アイテムサイズ
  };
  security: {
    enableEncryption: boolean;       // 暗号化有効化
    requireDeviceApproval: boolean;  // デバイス承認必須
    enableSensitiveFilter: boolean;  // センシティブデータフィルタ
    excludedApps: string[];          // 除外アプリケーション
  };
  network: {
    relayServerUrl?: string;         // リレーサーバーURL
    p2pPort: number;                 // P2Pリスニングポート
    discoveryEnabled: boolean;       // 自動検出有効化
  };
}
```

## 10. 開発フェーズ

### Phase 1: MVP (Minimum Viable Product)
- プレーンテキストのみ対応
- デスクトップ版（Windows/macOS/Linux）
- P2Pモードのみ
- 基本的な暗号化

### Phase 2: モバイル対応
- Android/iOSアプリの開発
- クラウドリレーモードの実装

### Phase 3: 拡張機能
- 画像・ファイル対応
- クリップボード履歴UI
- センシティブデータフィルタ

### Phase 4: エンタープライズ機能
- チーム機能
- 管理コンソール
- 詳細なログとモニタリング

## 11. ライセンスとプライバシー

- **ライセンス**: MIT License（オープンソース）
- **プライバシーポリシー**:
  - クリップボードデータはデバイス間でのみ送信され、サーバーに保存されない（クラウドモードでも中継のみ）
  - 分析データの収集は明示的なオプトインのみ
  - GDPR/CCPA準拠

## 12. 将来的な拡張性

- ブラウザ拡張機能（Chrome/Firefox/Edge）
- API公開（他のアプリケーションから利用可能に）
- クリップボード以外の同期（スニペット、メモなど）
- 音声・動画コンテンツのサポート
