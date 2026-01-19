# ClipBridge - はじめに

## デスクトップアプリケーションを試す（Windows/Linux）

### 1. 環境準備

#### Windows

必要なもの:
- [Node.js 18+](https://nodejs.org/)
- [Rust](https://www.rust-lang.org/tools/install)
- [Visual Studio C++ Build Tools](https://visualstudio.microsoft.com/visual-cpp-build-tools/)
- WebView2（Windows 10以降は標準搭載）

#### Linux (Ubuntu/Debian)

```bash
# システムパッケージのインストール
sudo apt update
sudo apt install -y \
  libwebkit2gtk-4.0-dev \
  build-essential \
  curl \
  wget \
  file \
  libssl-dev \
  libgtk-3-dev \
  libayatana-appindicator3-dev \
  librsvg2-dev

# Node.jsのインストール（nvm推奨）
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash
source ~/.bashrc
nvm install 18
nvm use 18

# Rustのインストール
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh
source ~/.cargo/env
```

### 2. プロジェクトのセットアップ

```bash
# リポジトリをクローン
git clone https://github.com/yourusername/clipbridge.git
cd clipbridge

# ルートの依存関係をインストール
npm install

# デスクトップパッケージに移動
cd packages/desktop

# デスクトップアプリの依存関係をインストール
npm install
```

### 3. アプリケーションの起動

#### 開発モードで起動

```bash
# packages/desktop ディレクトリで実行
npm run tauri:dev
```

初回起動時はRustの依存関係のビルドに時間がかかります（5-10分程度）。

#### リリースビルド

```bash
# packages/desktop ディレクトリで実行
npm run tauri:build
```

ビルド成果物:
- **Windows**: `src-tauri/target/release/bundle/msi/ClipBridge_0.1.0_x64_en-US.msi`
- **Linux**: `src-tauri/target/release/bundle/deb/clipbridge_0.1.0_amd64.deb`
- **Linux AppImage**: `src-tauri/target/release/bundle/appimage/clipbridge_0.1.0_amd64.AppImage`

### 4. アプリケーションの使い方

#### 初回起動

1. アプリケーションを起動すると、ウィンドウとシステムトレイにアイコンが表示されます
2. 「同期を開始」ボタンをクリックして同期を有効化

#### クリップボード同期のテスト

**同一ネットワーク内の2台のデバイスでテスト:**

1. デバイスA と デバイスB で ClipBridge を起動
2. 両方で「同期を開始」をクリック
3. デバイスディスカバリーが自動的に動作し、デバイスを検出
4. デバイスA でテキストをコピー
5. 数秒後、デバイスB のクリップボードに自動的に同期される

#### システムトレイ

- **左クリック**: ウィンドウの表示/非表示を切り替え
- **右クリック**: メニューを表示
  - Show: ウィンドウを表示
  - Start Sync: 同期を開始
  - Quit: アプリケーションを終了

### 5. トラブルシューティング

#### デバイスが検出されない

**確認事項:**
1. 両方のデバイスが同じネットワークに接続されているか
2. ファイアウォールでポート7878（UDP）と7879（TCP）が開いているか
3. mDNS/Bonjourが有効か

**ファイアウォール設定（Linux）:**
```bash
sudo ufw allow 7878/udp
sudo ufw allow 7879/tcp
```

**ファイアウォール設定（Windows）:**
PowerShellを管理者として実行:
```powershell
New-NetFirewallRule -DisplayName "ClipBridge UDP" -Direction Inbound -Protocol UDP -LocalPort 7878 -Action Allow
New-NetFirewallRule -DisplayName "ClipBridge TCP" -Direction Inbound -Protocol TCP -LocalPort 7879 -Action Allow
```

#### クリップボードが同期されない

1. 両方のデバイスで「同期を開始」がクリックされているか確認
2. ログを確認（コンソールに出力されます）
3. クリップボードに実際にテキストがコピーされているか確認

#### Linux: クリップボードの読み取りエラー

**X11の場合:**
```bash
sudo apt install xclip
```

**Waylandの場合:**
```bash
sudo apt install wl-clipboard
```

#### ビルドエラー

**Rust関連のエラー:**
```bash
# Rustツールチェーンを更新
rustup update

# キャッシュをクリア
cd packages/desktop/src-tauri
cargo clean
```

**Node.js関連のエラー:**
```bash
# node_modulesを削除して再インストール
rm -rf node_modules package-lock.json
npm install
```

### 6. 開発モード

アプリケーションをカスタマイズする場合:

```bash
cd packages/desktop

# フロントエンド（React）の開発
npm run dev

# 別のターミナルでTauriを起動
npm run tauri:dev
```

- フロントエンドのコード: `src/`
- バックエンドのコード: `src-tauri/src/`

変更はホットリロードで即座に反映されます（Rustコードを除く）。

### 7. ログの確認

開発モードで起動すると、ログがコンソールに出力されます:

```
[INFO] Clipboard monitor started
[INFO] Device discovery started
[INFO] P2P listener started on port 7879
[DEBUG] Sent discovery broadcast
[DEBUG] Discovered device: device-abc123 at 192.168.1.100:7878
```

## 次のステップ

- [開発ガイド](DEVELOPMENT.md) - コードベースの詳細
- [アーキテクチャ](ARCHITECTURE.md) - システム設計
- [仕様書](../SPECIFICATION.md) - 完全な技術仕様

## サポート

問題が発生した場合:
1. [GitHub Issues](https://github.com/yourusername/clipbridge/issues) で既存の問題を検索
2. 新しいIssueを作成（環境情報とログを含める）
3. [Contributing Guide](../CONTRIBUTING.md) でコントリビューション方法を確認
