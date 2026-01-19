# ClipBridge

[![CI](https://github.com/yourusername/clipbridge/actions/workflows/ci.yml/badge.svg)](https://github.com/yourusername/clipbridge/actions/workflows/ci.yml)
[![Build Desktop](https://github.com/yourusername/clipbridge/actions/workflows/build-desktop.yml/badge.svg)](https://github.com/yourusername/clipbridge/actions/workflows/build-desktop.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

クロスプラットフォーム対応のクリップボード同期システム

## 概要

ClipBridgeは、Windows、macOS、Ubuntu、Android、iOS間でクリップボードの内容をリアルタイムに同期するアプリケーションです。あるデバイスでコピーした内容を、別のデバイスでシームレスにペーストできます。

## 主な機能

- リアルタイムクリップボード同期
- エンドツーエンド暗号化
- P2P（ピアツーピア）およびクラウドリレーモード
- クリップボード履歴管理
- クロスプラットフォーム対応（Windows/macOS/Linux/Android/iOS）

## プロジェクト構成

```
clipbridge/
├── docs/                    # ドキュメント
├── packages/
│   ├── core/               # コアロジック（共通）
│   ├── desktop/            # デスクトップアプリ（Electron/Tauri）
│   ├── mobile/             # モバイルアプリ（React Native/Flutter）
│   ├── relay-server/       # リレーサーバー
│   └── protocol/           # 通信プロトコル定義
├── scripts/                # ビルド・開発用スクリプト
└── SPECIFICATION.md        # 詳細仕様書
```

## 開発状況

### ✅ 実装済み
- プロトコル定義とコアロジック（`@clipbridge/protocol`, `@clipbridge/core`）
- **デスクトップアプリケーション（Windows/Linux対応）**
  - Tauriベースの軽量アプリケーション
  - クリップボード監視と同期
  - P2Pネットワーク通信
  - デバイス自動検出
  - システムトレイ統合
  - React UI

### ⏳ 今後の実装
- macOS対応
- モバイルアプリケーション（Android/iOS）
- リレーサーバー（クラウドモード）
- 暗号化機能の完全実装
- 画像・ファイル対応

## クイックスタート

### デスクトップアプリ（Windows/Linux）

**前提条件:**
- Node.js 18+
- Rust 1.70+
- Linux: webkit2gtk, gtk3等の開発ライブラリ

**セットアップ:**

```bash
# リポジトリをクローン
git clone https://github.com/yourusername/clipbridge.git
cd clipbridge

# 依存関係のインストール
npm install

# デスクトップアプリを開発モードで起動
cd packages/desktop
npm run tauri:dev
```

詳細は [packages/desktop/README.md](packages/desktop/README.md) を参照してください。

## ドキュメント

- [SPECIFICATION.md](SPECIFICATION.md) - 詳細な技術仕様
- [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) - システムアーキテクチャ
- [docs/DEVELOPMENT.md](docs/DEVELOPMENT.md) - 開発ガイド
- [docs/GETTING_STARTED.md](docs/GETTING_STARTED.md) - はじめに
- [docs/RELEASE.md](docs/RELEASE.md) - リリースプロセス
- [packages/desktop/README.md](packages/desktop/README.md) - デスクトップアプリ開発
- [CHANGELOG.md](CHANGELOG.md) - 変更履歴
- [CONTRIBUTING.md](CONTRIBUTING.md) - コントリビューションガイド

## リリース

最新リリースは [Releases ページ](https://github.com/yourusername/clipbridge/releases) からダウンロードできます。

### ダウンロード

- **Windows**: `.msi` インストーラー
- **Linux**: `.deb` パッケージ（Ubuntu/Debian）

### ビルド済みバイナリ

GitHub Actionsで自動的にビルドされます。タグ（`v*`）をプッシュすると、Windows と Linux 用のインストーラーが自動生成されます。

詳細は [docs/RELEASE.md](docs/RELEASE.md) を参照してください。

## ライセンス

MIT License

## プライバシー

ClipBridgeは、ユーザーのプライバシーを最優先に設計されています:
- クリップボードデータはデバイス間でのみ送信されます
- エンドツーエンド暗号化により、中継サーバーでもデータを読み取ることはできません
- データの収集は明示的なオプトインのみ
