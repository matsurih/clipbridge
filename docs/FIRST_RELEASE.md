# 初回リリースガイド

ClipBridgeの最初のリリース（v0.1.0）を作成する手順です。

## 前提条件

- GitHubリポジトリが作成されている
- ローカルでビルドが成功している
- 全てのコードがコミットされている

## ステップ1: GitHubリポジトリの準備

### 1.1 リポジトリ作成

GitHubで新しいリポジトリを作成:
- リポジトリ名: `clipbridge`
- 可視性: Public または Private
- READMEは追加しない（既にローカルにあるため）

### 1.2 ローカルリポジトリをリモートに接続

```bash
# リモートリポジトリを追加
git remote add origin https://github.com/yourusername/clipbridge.git

# または SSH の場合
git remote add origin git@github.com:yourusername/clipbridge.git

# 初回プッシュ
git branch -M main
git push -u origin main
```

### 1.3 GitHubリポジトリ設定

1. **Settings** → **Actions** → **General**
2. **Workflow permissions** で以下を設定:
   - ✅ Read and write permissions
   - ✅ Allow GitHub Actions to create and approve pull requests

## ステップ2: アイコンの準備

デスクトップアプリにはアイコンが必要です。

### オプション1: Tauriのデフォルトアイコンを使用

Tauriは自動的にデフォルトアイコンを生成しますが、独自のアイコンを使うことを推奨します。

### オプション2: カスタムアイコンを作成

1. 1024x1024のPNG画像を作成
2. Tauriのアイコン生成ツールを使用:

```bash
cd packages/desktop
npm install -g @tauri-apps/cli

# カスタムアイコンから各サイズを生成
cargo tauri icon path/to/icon-1024.png
```

これにより、必要な全てのサイズのアイコンが `src-tauri/icons/` に生成されます。

## ステップ3: バージョン確認

全てのパッケージのバージョンが `0.1.0` であることを確認:

```bash
# 確認
grep -r "\"version\":" package.json packages/*/package.json
grep "^version" packages/desktop/src-tauri/Cargo.toml
```

必要に応じて、バージョンアップスクリプトを使用:

```bash
./scripts/bump-version.sh 0.1.0
```

## ステップ4: CHANGELOGの確認

[CHANGELOG.md](../CHANGELOG.md) を確認し、リリース日を更新:

```markdown
## [0.1.0] - 2025-01-20

### Added
- ✨ Initial release of ClipBridge
...
```

## ステップ5: コミットとプッシュ

```bash
# 全ての変更をコミット
git add .
git commit -m "chore: prepare for v0.1.0 release"

# mainブランチにプッシュ
git push origin main
```

## ステップ6: タグの作成とプッシュ

```bash
# タグを作成（v接頭辞が必須）
git tag v0.1.0

# タグをプッシュ（これによりGitHub Actionsが起動）
git push origin v0.1.0
```

## ステップ7: ビルドの確認

1. GitHubリポジトリの **Actions** タブを開く
2. "Build Desktop App" ワークフローが実行中であることを確認
3. ビルドの進行状況を監視:
   - Linux ビルド（約10-15分）
   - Windows ビルド（約10-15分）

### ビルドが失敗した場合

**よくあるエラー:**

1. **アイコンが見つからない**
   ```
   Error: Icon file not found
   ```
   対処: `packages/desktop/src-tauri/icons/` にアイコンを配置

2. **権限エラー**
   ```
   Error: Resource not accessible by integration
   ```
   対処: リポジトリ設定で "Read and write permissions" を有効化

3. **依存関係エラー**
   対処: ローカルで `npm ci` と `npm run tauri:build` を実行して確認

## ステップ8: リリースの公開

ビルドが成功すると、ドラフトリリースが自動作成されます。

1. GitHubリポジトリの **Releases** タブを開く
2. ドラフトリリース "v0.1.0" が表示される
3. リリースノートを確認・編集:

```markdown
# ClipBridge v0.1.0

初回リリースです！

## 🎉 主な機能

- クリップボードの自動同期（Windows/Linux）
- P2Pネットワーク通信
- デバイス自動検出
- システムトレイ統合
- モダンなReact UI

## 📥 ダウンロード

### Windows
- `ClipBridge_0.1.0_x64_en-US.msi` をダウンロード
- インストーラーを実行
- ファイアウォールの警告が出た場合は許可してください

### Linux (Ubuntu/Debian)
- `clipbridge_0.1.0_amd64.deb` をダウンロード
- `sudo dpkg -i clipbridge_0.1.0_amd64.deb` でインストール
- または、ファイルマネージャーでダブルクリック

## 🚀 使い方

1. アプリケーションを起動
2. 「同期を開始」をクリック
3. 同じネットワーク内の他のデバイスを自動検出
4. クリップボードが自動的に同期されます

## ⚠️ 注意事項

これはアルファ版です。以下の制限があります:

- 暗号化なし（テキストは平文で送信）
- デバイス認証なし
- テキストのみ対応（画像・ファイル未対応）

## 📚 ドキュメント

- [はじめに](docs/GETTING_STARTED.md)
- [開発ガイド](docs/DEVELOPMENT.md)
- [仕様書](SPECIFICATION.md)

## 🐛 問題報告

バグを見つけた場合は [Issues](https://github.com/yourusername/clipbridge/issues) で報告してください。
```

4. **Publish release** をクリック

## ステップ9: リリース後の確認

### アナウンス

リリースを告知する場合:
- GitHubのREADMEにリリースへのリンクを追加済み
- 必要に応じてSNSで共有
- ブログ記事を書く（オプション）

### モニタリング

- Issuesをチェック
- ダウンロード数を確認（GitHubのInsightsで表示）
- ユーザーフィードバックを収集

## ステップ10: 次のステップ

リリース後、次のバージョンの準備:

```bash
# developブランチを作成（推奨）
git checkout -b develop
git push origin develop
```

今後のワークフロー:
1. 新機能は `develop` ブランチで開発
2. リリース準備ができたら `main` にマージ
3. タグを作成してリリース

## トラブルシューティング

### タグを間違えた場合

```bash
# ローカルのタグを削除
git tag -d v0.1.0

# リモートのタグを削除
git push --delete origin v0.1.0

# 正しいタグを作成
git tag v0.1.0
git push origin v0.1.0
```

### ビルドをやり直す場合

1. GitHubリポジトリの **Actions** タブ
2. 失敗したワークフローを選択
3. **Re-run all jobs** をクリック

### リリースをキャンセルする場合

1. ドラフトリリースを削除
2. タグを削除（上記参照）
3. 問題を修正
4. 再度タグを作成

## チェックリスト

リリース前の最終確認:

- [ ] 全てのコードがコミット済み
- [ ] バージョン番号が正しい
- [ ] CHANGELOGが更新されている
- [ ] アイコンが配置されている
- [ ] ローカルでビルドが成功
- [ ] GitHubリポジトリの設定完了
- [ ] リモートにプッシュ済み
- [ ] タグを作成してプッシュ
- [ ] GitHub Actionsが成功
- [ ] リリースノートを編集
- [ ] リリースを公開

おめでとうございます！🎉 ClipBridgeの初回リリースが完了しました！
