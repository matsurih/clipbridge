# ClipBridge Desktop

ClipBridgeのデスクトップアプリケーション（Windows/Linux対応）

## 技術スタック

- **フレームワーク**: Tauri 1.5
- **フロントエンド**: React 18 + TypeScript
- **バックエンド**: Rust
- **ビルドツール**: Vite

## 機能

- ✅ クリップボードの監視と同期
- ✅ P2Pネットワーク通信
- ✅ デバイス自動検出（mDNS）
- ✅ システムトレイ統合
- ✅ Windows/Linux対応

## 開発環境のセットアップ

### 必要な環境

**共通:**
- Node.js 18+
- Rust 1.70+
- npm 9+

**Windows:**
- Microsoft Visual Studio C++ Build Tools
- WebView2 (Windows 10以降は標準搭載)

**Linux:**
- 以下のパッケージが必要:
  ```bash
  # Ubuntu/Debian
  sudo apt install libwebkit2gtk-4.0-dev \
    build-essential \
    curl \
    wget \
    file \
    libssl-dev \
    libgtk-3-dev \
    libayatana-appindicator3-dev \
    librsvg2-dev

  # Fedora
  sudo dnf install webkit2gtk4.0-devel \
    openssl-devel \
    curl \
    wget \
    file \
    libappindicator-gtk3-devel \
    librsvg2-devel

  # Arch
  sudo pacman -S webkit2gtk \
    base-devel \
    curl \
    wget \
    file \
    openssl \
    appmenu-gtk-module \
    gtk3 \
    libappindicator-gtk3 \
    librsvg
  ```

### インストール

```bash
# デスクトップパッケージディレクトリに移動
cd packages/desktop

# 依存関係をインストール
npm install
```

### 開発モードで実行

```bash
# 開発モードで起動
npm run tauri:dev
```

これにより、Tauriアプリケーションが起動し、ホットリロードが有効になります。

### ビルド

```bash
# リリースビルド
npm run tauri:build
```

ビルド成果物は `src-tauri/target/release/bundle/` に出力されます。

## プロジェクト構成

```
desktop/
├── src/                      # React フロントエンド
│   ├── App.tsx              # メインアプリケーションコンポーネント
│   ├── App.css              # アプリケーションスタイル
│   ├── main.tsx             # エントリーポイント
│   └── index.css            # グローバルスタイル
├── src-tauri/               # Tauri バックエンド
│   ├── src/
│   │   ├── main.rs          # メインアプリケーション
│   │   ├── clipboard/       # クリップボードモジュール
│   │   │   ├── mod.rs       # モジュール定義
│   │   │   ├── windows.rs   # Windows実装
│   │   │   └── linux.rs     # Linux実装
│   │   └── network/         # ネットワークモジュール
│   │       ├── mod.rs       # モジュール定義
│   │       ├── p2p.rs       # P2P通信
│   │       ├── discovery.rs # デバイス検出
│   │       └── message.rs   # メッセージ定義
│   ├── Cargo.toml           # Rust依存関係
│   ├── tauri.conf.json      # Tauri設定
│   └── icons/               # アプリケーションアイコン
├── index.html               # HTMLテンプレート
├── package.json             # Node.js依存関係
├── tsconfig.json            # TypeScript設定
└── vite.config.ts           # Vite設定
```

## 実装されている機能

### クリップボード管理
- プラットフォーム固有のクリップボードアクセス
- 変更の自動検出（500msポーリング）
- テキストの読み書き

### ネットワーク
- P2P通信（TCP、ポート7879）
- デバイス検出（UDP multicast、ポート7878）
- メッセージのシリアライゼーション（JSON）

### UI
- 同期状態の表示
- 現在のクリップボード内容の表示
- 同期の開始/停止

## Tauri コマンド

アプリケーションで利用可能なTauriコマンド:

- `start_sync()` - 同期を開始
- `stop_sync()` - 同期を停止
- `get_clipboard_text()` - クリップボードのテキストを取得
- `set_clipboard_text(text: string)` - クリップボードにテキストを設定
- `is_syncing()` - 同期状態を確認

## トラブルシューティング

### Linux: クリップボードが機能しない

X11を使用している場合、xclipがインストールされているか確認:
```bash
sudo apt install xclip  # Ubuntu/Debian
```

Waylandの場合、wl-clipboardが必要:
```bash
sudo apt install wl-clipboard  # Ubuntu/Debian
```

### Windows: ビルドエラー

Visual Studio C++ Build Toolsがインストールされているか確認してください。

### ポート競合

デフォルトポート:
- P2P通信: 7879
- デバイス検出: 7878

他のアプリケーションがこれらのポートを使用している場合は、`src-tauri/src/network/` のポート番号を変更してください。

## 今後の実装予定

- [ ] 暗号化（AES-256-GCM）
- [ ] デバイス認証
- [ ] 画像・ファイル対応
- [ ] クリップボード履歴の永続化
- [ ] 設定UI
- [ ] 自動起動設定
- [ ] システムトレイメニューの拡張

## ライセンス

MIT License
