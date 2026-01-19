# ClipBridge リリースガイド

## 自動ビルドとリリース

ClipBridgeは、GitHub Actionsを使用して自動的にビルドとリリースを行います。

## リリースプロセス

### 1. バージョン番号の更新

リリース前に、以下のファイルのバージョン番号を更新します：

```bash
# ルートパッケージ
vim package.json  # "version": "0.2.0"

# プロトコルパッケージ
vim packages/protocol/package.json  # "version": "0.2.0"

# コアパッケージ
vim packages/core/package.json  # "version": "0.2.0"

# デスクトップパッケージ
vim packages/desktop/package.json  # "version": "0.2.0"
vim packages/desktop/src-tauri/Cargo.toml  # version = "0.2.0"
vim packages/desktop/src-tauri/tauri.conf.json  # "version": "0.2.0"
```

### 2. 変更履歴の更新

`CHANGELOG.md`を作成/更新します：

```markdown
# Changelog

## [0.2.0] - 2025-01-XX

### Added
- 新機能の説明

### Changed
- 変更内容の説明

### Fixed
- 修正内容の説明
```

### 3. コミットとタグ作成

```bash
# 変更をコミット
git add .
git commit -m "chore: bump version to 0.2.0"

# タグを作成（v接頭辞が必要）
git tag v0.2.0

# リモートにプッシュ
git push origin main
git push origin v0.2.0
```

### 4. 自動ビルド

タグをプッシュすると、GitHub Actionsが自動的に以下を実行します：

1. **Linux ビルド** (Ubuntu 22.04)
   - `.deb`パッケージの作成
   - AppImageの作成（将来）

2. **Windows ビルド** (Windows Latest)
   - `.msi`インストーラーの作成

3. **リリース作成**
   - ドラフトリリースを作成
   - ビルド成果物を添付
   - リリースノートを自動生成

### 5. リリースの公開

1. GitHubのリリースページにアクセス
2. ドラフトリリースを確認
3. リリースノートを編集（必要に応じて）
4. "Publish release"をクリック

## ワークフローの詳細

### build-desktop.yml

**トリガー:**
- `v*`形式のタグがプッシュされた時
- 手動実行（`workflow_dispatch`）

**ジョブ:**

#### build
複数プラットフォームでビルドを並列実行：

**Linux (ubuntu-22.04):**
- 必要なシステムパッケージをインストール
- Node.js/Rustをセットアップ
- Tauriアプリケーションをビルド
- `.deb`パッケージを生成
- アーティファクトをアップロード

**Windows (windows-latest):**
- Node.js/Rustをセットアップ
- Tauriアプリケーションをビルド
- `.msi`インストーラーを生成
- アーティファクトをアップロード

#### release
ビルド完了後に実行：

- 全てのアーティファクトをダウンロード
- GitHubリリースを作成（ドラフト）
- ビルド成果物を添付
- リリースノートを自動生成

### ci.yml

**トリガー:**
- `main`, `develop`ブランチへのプッシュ
- `main`, `develop`ブランチへのPull Request

**ジョブ:**
- リント実行
- TypeScriptコンパイル
- Rustコードチェック（clippy, fmt）
- テスト実行

## 手動ビルド

必要に応じて手動でビルドすることも可能です：

### Linux

```bash
cd packages/desktop
npm install
npm run tauri:build

# 成果物の場所
ls src-tauri/target/release/bundle/deb/
ls src-tauri/target/release/bundle/appimage/
```

### Windows

```bash
cd packages/desktop
npm install
npm run tauri:build

# 成果物の場所
dir src-tauri\target\release\bundle\msi\
```

## トラブルシューティング

### ビルドが失敗する

**Linux依存関係のエラー:**
```bash
# 必要なパッケージを確認
sudo apt-get install -y \
  libwebkit2gtk-4.0-dev \
  build-essential \
  curl \
  wget \
  file \
  libssl-dev \
  libgtk-3-dev \
  libayatana-appindicator3-dev \
  librsvg2-dev
```

**Rustキャッシュのエラー:**
- GitHub Actionsのキャッシュをクリア
- ワークフローを再実行

**アーティファクトが見つからない:**
- ビルドログを確認
- パスパターンが正しいか確認

### リリースが作成されない

**パーミッションエラー:**
- リポジトリ設定で`GITHUB_TOKEN`のパーミッションを確認
- `contents: write`権限が必要

**タグの形式:**
- タグは`v*`形式である必要があります（例: `v0.2.0`）
- `0.2.0`のようなタグは無視されます

## ベストプラクティス

### バージョニング

Semantic Versioningに従います：

- **MAJOR** (例: 1.0.0 → 2.0.0): 互換性のない変更
- **MINOR** (例: 1.0.0 → 1.1.0): 後方互換性のある機能追加
- **PATCH** (例: 1.0.0 → 1.0.1): 後方互換性のあるバグ修正

### プレリリース

アルファ/ベータ版の場合：

```bash
# アルファ版
git tag v0.2.0-alpha.1

# ベータ版
git tag v0.2.0-beta.1

# リリース候補
git tag v0.2.0-rc.1
```

### リリースノート

リリースノートには以下を含めます：

1. **新機能**: 追加された機能
2. **変更**: 既存機能の変更
3. **修正**: バグ修正
4. **セキュリティ**: セキュリティ関連の修正
5. **破壊的変更**: 互換性のない変更
6. **非推奨**: 将来削除される機能

例：
```markdown
## [0.2.0] - 2025-01-25

### Added
- 🔐 AES-256-GCMによるエンドツーエンド暗号化
- 🔑 Ed25519デバイス認証

### Changed
- ⚡ クリップボード検出を200msに高速化

### Fixed
- 🐛 Linux環境でのクリップボード読み取りエラーを修正

### Security
- 🔒 センシティブデータフィルタを追加

## [0.1.0] - 2025-01-20

### Added
- ✨ 初回リリース
- 📋 Windows/Linuxクリップボード同期
- 🌐 P2Pネットワーク通信
- 🔍 デバイス自動検出
```

## GitHub Secrets

現在、追加のシークレットは不要です。`GITHUB_TOKEN`が自動的に提供されます。

将来、以下が必要になる可能性があります：

- コード署名証明書（Windows）
- 公証キー（macOS）
- クラウドストレージのAPIキー

## モニタリング

リリースの健全性を確認：

1. **ビルドステータス**: GitHub Actionsのバッジをチェック
2. **ダウンロード数**: リリースページで確認
3. **イシュー**: リリース後のバグレポートを監視

## 次のステップ

- [ ] macOSビルドサポート追加
- [ ] コード署名の設定
- [ ] 自動アップデート機能
- [ ] ナイトリービルド
- [ ] テストカバレッジレポート
