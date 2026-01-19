# ClipBridge アーキテクチャドキュメント

## システム概要

ClipBridgeは、複数デバイス間でクリップボードをリアルタイムに同期するクロスプラットフォームシステムです。

## レイヤー構造

### 1. Protocol Layer (`@clipbridge/protocol`)
プロトコル定義と型システムを提供します。

**責務:**
- データ型の定義（ClipboardItem, Device, Message等）
- バリデーション関数
- ユーティリティ関数（ID生成、メッセージ作成等）

**主要ファイル:**
- `types.ts` - 全ての型定義
- `validation.ts` - バリデーション関数
- `utils.ts` - ヘルパー関数

### 2. Core Layer (`@clipbridge/core`)
同期エンジンとビジネスロジックを実装します。

**責務:**
- クリップボードアイテムの同期ロジック
- デバイス管理
- ストレージ抽象化
- クリップボード監視の抽象化

**主要コンポーネント:**

#### SyncEngine
```typescript
class SyncEngine extends EventEmitter
```
- クリップボードアイテムの送受信
- デバイスの登録・管理
- 同期状態の管理
- 重複検出

**主要メソッド:**
- `processIncomingItem()` - 受信したアイテムの処理
- `sendItem()` - アイテムの送信
- `registerDevice()` - デバイスの登録
- `pause()/resume()` - 同期の一時停止/再開

#### ClipboardManager (抽象クラス)
```typescript
abstract class ClipboardManager extends EventEmitter
```
- プラットフォーム固有のクリップボードアクセス
- 変更検知
- 読み書き操作

**実装が必要なメソッド:**
- `startMonitoring()` - クリップボード監視開始
- `stopMonitoring()` - 監視停止
- `readClipboard()` - クリップボード読み取り
- `writeClipboard()` - クリップボード書き込み

#### StorageManager
```typescript
class StorageManager
```
- 設定の永続化
- クリップボード履歴の保存
- デバイス情報の管理

### 3. Desktop Layer (`@clipbridge/desktop`)
デスクトップアプリケーション実装（Electron/Tauri）

**責務:**
- プラットフォーム固有のClipboardManager実装
- システムトレイ統合
- ネットワーク層実装（P2P/クラウド）
- UI実装

**プラットフォーム別実装:**
- `WindowsClipboardManager` - Win32 API使用
- `MacOSClipboardManager` - NSPasteboard使用
- `LinuxClipboardManager` - X11/Wayland使用

### 4. Mobile Layer (`@clipbridge/mobile`)
モバイルアプリケーション実装（React Native/Flutter）

**責務:**
- モバイル用ClipboardManager実装
- バックグラウンド同期
- モバイルUI

### 5. Relay Server (`@clipbridge/relay-server`)
クラウドモード用のリレーサーバー

**責務:**
- WebSocket接続管理
- メッセージルーティング
- デバイスレジストリ

## データフロー

### クリップボード変更時のフロー

```
┌─────────────────┐
│ User copies     │
│ text/image      │
└────────┬────────┘
         │
         ▼
┌─────────────────────────┐
│ ClipboardManager        │
│ - Detects change        │
│ - Reads clipboard       │
└────────┬────────────────┘
         │
         │ emit('change', data)
         ▼
┌─────────────────────────┐
│ Application Layer       │
│ - Creates ClipboardItem │
│ - Adds signature        │
└────────┬────────────────┘
         │
         ▼
┌─────────────────────────┐
│ SyncEngine              │
│ - Validates item        │
│ - Checks if paused      │
│ - Adds to cache         │
└────────┬────────────────┘
         │
         │ emit('itemSent', item)
         ▼
┌─────────────────────────┐
│ Network Layer           │
│ - Encrypts data         │
│ - Sends to devices      │
└─────────────────────────┘
```

### アイテム受信時のフロー

```
┌─────────────────────────┐
│ Network Layer           │
│ - Receives message      │
│ - Decrypts data         │
└────────┬────────────────┘
         │
         ▼
┌─────────────────────────┐
│ SyncEngine              │
│ - Validates item        │
│ - Checks deduplication  │
│ - Verifies device       │
└────────┬────────────────┘
         │
         │ emit('itemReceived', item)
         ▼
┌─────────────────────────┐
│ Application Layer       │
│ - Verifies signature    │
│ - Filters sensitive     │
└────────┬────────────────┘
         │
         ▼
┌─────────────────────────┐
│ ClipboardManager        │
│ - Writes to clipboard   │
└────────┬────────────────┘
         │
         ▼
┌─────────────────┐
│ User can paste  │
└─────────────────┘
```

## セキュリティアーキテクチャ

### 暗号化レイヤー

```
Application Data
      │
      ▼
[AES-256-GCM Encryption]
      │
      ▼
[Signature (Ed25519)]
      │
      ▼
[TLS 1.3 Transport]
      │
      ▼
Network Transmission
```

### 鍵管理

1. **デバイス鍵ペア**: 起動時に生成または読み込み
   - Ed25519鍵ペア（署名用）

2. **セッション鍵**: ECDH鍵交換で生成
   - Curve25519使用
   - 1時間ごとにローテーション

3. **データ暗号化**: AES-256-GCM
   - セッション鍵で暗号化
   - 各アイテムに固有のnonce使用

## パフォーマンス最適化

### 1. 重複検出
- 最近送受信したアイテムのIDをキャッシュ
- ハッシュベースの変更検知

### 2. 帯域幅最適化
- 大きなアイテムは圧縮（gzip）
- 差分同期（将来的な拡張）

### 3. メモリ管理
- 履歴サイズの制限
- 古いキャッシュの定期的なクリーンアップ

## 拡張性

### プラグインシステム（将来的）
```typescript
interface Plugin {
  name: string;
  version: string;
  init(context: PluginContext): Promise<void>;
  onClipboardChange?(item: ClipboardItem): Promise<ClipboardItem>;
  onBeforeSend?(item: ClipboardItem): Promise<ClipboardItem>;
  onBeforeWrite?(item: ClipboardItem): Promise<ClipboardItem>;
}
```

### カスタムトランスポート
```typescript
interface Transport {
  connect(): Promise<void>;
  disconnect(): Promise<void>;
  send(message: Message): Promise<void>;
  on(event: 'message', handler: (msg: Message) => void): void;
}
```

## 開発ガイドライン

### 新しいプラットフォームの追加

1. `ClipboardManager`を継承したクラスを実装
2. プラットフォーム固有のクリップボードAPIを使用
3. テストケースを作成
4. ドキュメントを更新

### 新しいデータ形式のサポート

1. `ClipboardDataType`に新しい型を追加
2. シリアライゼーション/デシリアライゼーション実装
3. バリデーション関数を更新
4. 各プラットフォームでの対応を実装

## トラブルシューティング

### 一般的な問題

**同期が遅い**
- ネットワーク接続を確認
- ファイアウォール設定を確認
- クラウドモードの場合、リレーサーバーのレイテンシを確認

**デバイスが見つからない（P2Pモード）**
- 同じネットワークに接続されているか確認
- mDNS/Bonjourが有効か確認
- ファイアウォールでポートがブロックされていないか確認

**クリップボードが更新されない**
- アプリがバックグラウンドで実行されているか確認
- 同期が一時停止していないか確認
- 除外アプリリストに含まれていないか確認
