# ClipBridge Icons

このディレクトリにアイコンファイルを配置してください。

## 必要なアイコン

- `32x32.png` - 32x32ピクセルのPNG
- `128x128.png` - 128x128ピクセルのPNG
- `128x128@2x.png` - 256x256ピクセルのPNG (Retina用)
- `icon.icns` - macOS用アイコン
- `icon.ico` - Windows用アイコン
- `icon.png` - システムトレイ用アイコン

## アイコン生成

Tauriのアイコン生成ツールを使用できます:

```bash
npm install -g @tauri-apps/cli
cargo tauri icon path/to/source-icon.png
```

これにより、1024x1024のソースアイコンから全ての必要なサイズが自動生成されます。
