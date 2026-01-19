# ClipBridge 開発ガイド

## セットアップ

### 必要な環境

- Node.js 18.0.0 以上
- npm 9.0.0 以上
- Git

### プロジェクトのクローンとセットアップ

```bash
# リポジトリのクローン
git clone https://github.com/yourusername/clipbridge.git
cd clipbridge

# 依存関係のインストール
npm install

# 全パッケージのビルド
npm run build
```

## プロジェクト構成

```
clipbridge/
├── packages/
│   ├── protocol/         # プロトコル定義・型
│   ├── core/            # コア同期エンジン
│   ├── desktop/         # デスクトップアプリ
│   ├── mobile/          # モバイルアプリ
│   └── relay-server/    # リレーサーバー
├── docs/                # ドキュメント
├── scripts/             # ビルド・ユーティリティスクリプト
└── SPECIFICATION.md     # 仕様書
```

## 開発ワークフロー

### 開発サーバーの起動

```bash
# 全パッケージの開発モードで起動
npm run dev

# 特定のパッケージのみ
cd packages/desktop
npm run dev
```

### ビルド

```bash
# 全パッケージをビルド
npm run build

# リリースビルド
npm run build:release
```

### テスト

```bash
# 全パッケージのテストを実行
npm test

# 特定のパッケージのテスト
cd packages/core
npm test

# カバレッジ付きでテスト
npm run test:coverage
```

### リント・フォーマット

```bash
# リント実行
npm run lint

# 自動フォーマット
npm run format
```

## パッケージ詳細

### @clipbridge/protocol

プロトコル定義と共通型。

**開発時の注意点:**
- 型定義を変更した場合、全パッケージの再ビルドが必要
- バリデーション関数は必ず追加

**主要ファイル:**
- `src/types.ts` - 型定義
- `src/validation.ts` - バリデーション
- `src/utils.ts` - ユーティリティ

### @clipbridge/core

同期エンジンの実装。

**開発時の注意点:**
- プラットフォーム依存コードは入れない
- 全てのロジックに単体テストを書く

**主要クラス:**
- `SyncEngine` - 同期ロジック
- `ClipboardManager` - 抽象基底クラス
- `StorageManager` - ストレージ管理

### @clipbridge/desktop

デスクトップアプリケーション実装。

**技術スタック候補:**
- Electron + TypeScript
- または Tauri + Rust/TypeScript

**実装が必要な機能:**
- プラットフォーム固有のClipboardManager
- システムトレイ統合
- P2P通信
- UI

### @clipbridge/mobile

モバイルアプリケーション実装。

**技術スタック候補:**
- React Native + TypeScript
- または Flutter + Dart

**実装が必要な機能:**
- モバイルClipboardManager
- バックグラウンド同期
- UI

### @clipbridge/relay-server

クラウドリレーサーバー。

**技術スタック候補:**
- Node.js + TypeScript + Socket.io
- または Rust + tokio + tungstenite

**実装が必要な機能:**
- WebSocket接続管理
- メッセージルーティング
- デバイスレジストリ

## コーディング規約

### TypeScript

```typescript
// ✅ Good
interface UserData {
  id: string;
  name: string;
}

async function fetchUser(id: string): Promise<UserData> {
  // Implementation
}

// ❌ Bad
interface userData {
  id: any;
  name: any;
}

function fetchUser(id) {
  // Implementation
}
```

### 命名規則

- **クラス**: PascalCase (`SyncEngine`, `ClipboardManager`)
- **関数・変数**: camelCase (`processItem`, `deviceId`)
- **定数**: UPPER_SNAKE_CASE (`DEFAULT_CONFIG`, `MAX_ITEM_SIZE`)
- **型・インターフェース**: PascalCase (`ClipboardItem`, `Message`)
- **Enum**: PascalCase、値もPascalCase (`MessageType.CLIPBOARD_UPDATE`)

### エラーハンドリング

```typescript
// ✅ Good
try {
  await processItem(item);
} catch (error) {
  logger.error('Failed to process item', error);
  this.emit('error', error as Error);
}

// ❌ Bad
try {
  await processItem(item);
} catch (error) {
  console.log('Error:', error);
}
```

### イベント駆動設計

```typescript
// ✅ Good
class SyncEngine extends EventEmitter<SyncEngineEvents> {
  async sendItem(item: ClipboardItem): Promise<void> {
    // Process item
    this.emit('itemSent', item);
  }
}

// Usage
syncEngine.on('itemSent', (item) => {
  console.log('Item sent:', item.id);
});
```

## テスト

### 単体テスト

```typescript
import { SyncEngine } from '../sync-engine';
import { createClipboardItem, ClipboardDataType } from '@clipbridge/protocol';

describe('SyncEngine', () => {
  let engine: SyncEngine;

  beforeEach(() => {
    engine = new SyncEngine('test-device-id');
  });

  test('should emit itemSent event when sending item', async () => {
    const item = createClipboardItem('device-1', ClipboardDataType.PLAIN_TEXT, 'test', {});

    const listener = jest.fn();
    engine.on('itemSent', listener);

    await engine.sendItem(item);

    expect(listener).toHaveBeenCalledWith(expect.objectContaining({
      deviceId: 'test-device-id',
    }));
  });
});
```

### 統合テスト

```typescript
describe('ClipBoard Sync Integration', () => {
  test('should sync clipboard between two devices', async () => {
    const device1 = new SyncEngine('device-1');
    const device2 = new SyncEngine('device-2');

    // Setup connection between devices
    // ...

    const item = createClipboardItem('device-1', ClipboardDataType.PLAIN_TEXT, 'Hello');

    const received = new Promise((resolve) => {
      device2.on('itemReceived', resolve);
    });

    await device1.sendItem(item);

    const receivedItem = await received;
    expect(receivedItem).toEqual(expect.objectContaining({
      content: expect.objectContaining({
        preview: 'Hello',
      }),
    }));
  });
});
```

## デバッグ

### ログレベル

開発時は環境変数でログレベルを設定:

```bash
DEBUG=clipbridge:* npm run dev
```

### Visual Studio Code設定

`.vscode/launch.json`:

```json
{
  "version": "0.2.0",
  "configurations": [
    {
      "type": "node",
      "request": "launch",
      "name": "Debug Desktop App",
      "cwd": "${workspaceFolder}/packages/desktop",
      "runtimeExecutable": "npm",
      "runtimeArgs": ["run", "dev"],
      "console": "integratedTerminal"
    }
  ]
}
```

## リリース

### バージョニング

Semantic Versioningに従う:
- MAJOR: 互換性のない変更
- MINOR: 後方互換性のある機能追加
- PATCH: 後方互換性のあるバグ修正

### リリースプロセス

```bash
# バージョンアップ
npm version patch  # または minor, major

# ビルド
npm run build

# タグをプッシュ
git push --tags

# リリース
npm run release
```

## トラブルシューティング

### ビルドエラー

**問題**: TypeScriptコンパイルエラー

```bash
# キャッシュをクリア
npm run clean
rm -rf node_modules package-lock.json
npm install
npm run build
```

**問題**: モジュール解決エラー

```bash
# ワークスペースのリンクを再構築
npm install
```

### 開発中の問題

**問題**: ホットリロードが動作しない

- ファイルウォッチャーの制限を確認
- `package.json`のdevスクリプトを確認

**問題**: テストが失敗する

- モックの設定を確認
- 非同期処理の完了を待っているか確認

## コントリビューション

1. Issueを作成して問題を議論
2. フィーチャーブランチを作成
3. コードを実装し、テストを書く
4. Pull Requestを作成
5. コードレビューを受ける

### Pull Request チェックリスト

- [ ] テストが全て通る
- [ ] リントエラーがない
- [ ] 適切なコミットメッセージ
- [ ] ドキュメントを更新（必要な場合）
- [ ] CHANGELOGに追記（必要な場合）

## 参考資料

- [SPECIFICATION.md](../SPECIFICATION.md) - 詳細仕様
- [ARCHITECTURE.md](./ARCHITECTURE.md) - アーキテクチャ設計
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Electron Documentation](https://www.electronjs.org/docs)
- [React Native Documentation](https://reactnative.dev/docs/getting-started)
