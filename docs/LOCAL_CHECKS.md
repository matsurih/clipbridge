# ローカルでのCI/CDチェック

GitHub Actionsにプッシュする前に、ローカルで同じチェックを実行できます。

## クイックスタート

### 高速チェック（推奨）

TypeScriptとRustの型チェックのみ実行（ビルドなし）：

```bash
pnpm run check:quick
```

または直接：

```bash
./scripts/quick-check.sh
```

**実行時間**: 約10-30秒

### 完全チェック

GitHub Actionsと同じ全てのチェックを実行：

```bash
pnpm run check
```

または直接：

```bash
./scripts/check-ci.sh
```

**実行時間**: 約2-5分

## 個別チェック

### TypeScriptの型チェック

全パッケージ：
```bash
pnpm run typecheck
```

個別パッケージ：
```bash
cd packages/desktop
pnpm run typecheck
```

### ビルドチェック

全パッケージ：
```bash
pnpm run build
```

個別パッケージ：
```bash
cd packages/protocol
pnpm run build
```

### Rustチェック

フォーマットチェック：
```bash
cd packages/desktop/src-tauri
cargo fmt --check
```

Lintチェック（clippy）：
```bash
cd packages/desktop/src-tauri
cargo clippy -- -D warnings
```

## スクリプト詳細

### check-ci.sh

GitHub Actionsの完全な再現：

1. 依存関係のインストール
2. Protocol パッケージのビルド
3. Core パッケージのビルド
4. Desktop フロントエンドのビルド
5. TypeScript型チェック（全パッケージ）
6. Rustフォーマットチェック
7. Rust Lintチェック（clippy）

### quick-check.sh

最小限の高速チェック：

1. Desktop パッケージのTypeScript型チェック（ビルドなし）
2. Rustフォーマットチェック

## プッシュ前のワークフロー

### 推奨フロー

```bash
# 1. コードを変更

# 2. クイックチェック実行
pnpm run check:quick

# 3. 問題があれば修正

# 4. コミット
git add .
git commit -m "fix: ..."

# 5. プッシュ前に完全チェック（オプション）
pnpm run check

# 6. プッシュ
git push
```

### エラーが出た場合

#### TypeScriptエラー

```bash
# エラー内容を確認
pnpm run typecheck

# 修正後、再度チェック
pnpm run typecheck
```

よくあるエラー：
- 未使用の変数: `'foo' is declared but its value is never read`
- 型の不一致: `Type 'X' is not assignable to type 'Y'`

#### Rustフォーマットエラー

```bash
# 自動修正
cd packages/desktop/src-tauri
cargo fmt

# 確認
cargo fmt --check
```

#### Rust Lintエラー

```bash
# エラー詳細を確認
cd packages/desktop/src-tauri
cargo clippy

# 修正後、厳格チェック
cargo clippy -- -D warnings
```

## Git Hooks（将来的に追加予定）

pre-commitフックを設定すると、コミット前に自動チェックできます：

```bash
# .git/hooks/pre-commit
#!/bin/bash
./scripts/quick-check.sh
```

## トラブルシューティング

### pnpmが見つからない

```bash
npm install -g pnpm
```

### Rustツールがない

フォーマッター：
```bash
rustup component add rustfmt
```

Linter：
```bash
rustup component add clippy
```

### スクリプトが実行できない

権限を追加：
```bash
chmod +x scripts/*.sh
```

### ビルドエラーが解決しない

クリーンビルド：
```bash
pnpm run clean
rm -rf node_modules
pnpm install
pnpm run build
```

Rustのクリーン：
```bash
cd packages/desktop/src-tauri
cargo clean
```

## CI/CDとの違い

ローカルチェックとGitHub Actionsの主な違い：

| 項目 | ローカル | GitHub Actions |
|-----|---------|----------------|
| 環境 | あなたのPC | Ubuntu/Windows VM |
| 依存関係 | 既存のnode_modules | クリーンインストール |
| キャッシュ | あり | Rustのみ |
| 並列実行 | なし | Windows/Linux同時 |

GitHub Actionsでのみ発生するエラーは稀ですが、以下が考えられます：
- 環境変数の違い
- OSの違い（改行コード等）
- 依存関係のバージョン固定の問題

## パフォーマンス

チェック時間の目安（M1 Mac、初回）：

| チェック | 時間 |
|---------|------|
| quick-check | 10-30秒 |
| typecheck | 30-60秒 |
| build (全体) | 2-3分 |
| check (完全) | 3-5分 |

2回目以降はキャッシュで高速化されます。

## まとめ

**日常的な開発**：
```bash
pnpm run check:quick
```

**プッシュ前の最終確認**：
```bash
pnpm run check
```

**タグ作成/リリース前**：
```bash
pnpm run check
cd packages/desktop
pnpm run tauri:build
```
