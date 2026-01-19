# Contributing to ClipBridge

ClipBridgeへのコントリビューションに興味を持っていただき、ありがとうございます！

## 行動規範

このプロジェクトに参加する全ての人は、相互に尊重し、建設的な環境を維持することが期待されます。

## コントリビューションの方法

### バグ報告

バグを発見した場合:

1. 既存のIssueで同じ問題が報告されていないか確認
2. 新しいIssueを作成し、以下の情報を含める:
   - バグの詳細な説明
   - 再現手順
   - 期待される動作
   - 実際の動作
   - 環境情報（OS、バージョン等）
   - スクリーンショット（可能であれば）

### 機能リクエスト

新しい機能を提案する場合:

1. Issueを作成し、以下を含める:
   - 機能の説明
   - ユースケース
   - 期待される利点
   - 可能な実装方法（オプション）

### コードのコントリビューション

#### 開発環境のセットアップ

```bash
# リポジトリをフォーク
# フォークをクローン
git clone https://github.com/YOUR_USERNAME/clipbridge.git
cd clipbridge

# 依存関係をインストール
npm install

# ビルドを実行
npm run build

# テストを実行
npm test
```

詳細は [docs/DEVELOPMENT.md](docs/DEVELOPMENT.md) を参照してください。

#### ブランチ戦略

- `main` - 安定版
- `develop` - 開発版
- `feature/xxx` - 新機能
- `fix/xxx` - バグ修正
- `docs/xxx` - ドキュメント

#### ワークフロー

1. **Issueを作成または選択**
   - 作業を開始する前にIssueで議論

2. **ブランチを作成**
   ```bash
   git checkout -b feature/your-feature-name
   ```

3. **コードを実装**
   - コーディング規約に従う
   - 必要なテストを追加
   - コミットメッセージは明確に

4. **テストを実行**
   ```bash
   npm test
   npm run lint
   ```

5. **コミット**
   ```bash
   git add .
   git commit -m "feat: add new feature"
   ```

   コミットメッセージの形式:
   - `feat:` - 新機能
   - `fix:` - バグ修正
   - `docs:` - ドキュメント
   - `style:` - フォーマット
   - `refactor:` - リファクタリング
   - `test:` - テスト追加
   - `chore:` - その他の変更

6. **プッシュとPull Request作成**
   ```bash
   git push origin feature/your-feature-name
   ```

   Pull Requestには以下を含める:
   - 変更の概要
   - 関連するIssue番号
   - スクリーンショット（UI変更の場合）
   - テスト方法

#### コードレビュー

- 全てのPull Requestはレビューが必要
- フィードバックに対して建設的に対応
- 必要に応じてコードを修正

#### マージ後

- ブランチは削除される
- 変更はdevelopブランチにマージされる
- 定期的にmainブランチにリリースされる

## コーディング規約

### TypeScript

- 厳格な型チェックを使用
- `any`の使用は避ける
- インターフェースで型を定義

### スタイル

- Prettierで自動フォーマット
- ESLintルールに従う
- 実行: `npm run format`

### ドキュメント

- 公開APIにはJSDocコメントを追加
- 複雑なロジックにはコメントを追加
- READMEやドキュメントを更新

### テスト

- 新機能には必ずテストを追加
- カバレッジ80%以上を維持
- エッジケースもテスト

## パッケージの構造

```
packages/
├── protocol/     # プロトコル定義
├── core/        # コアロジック
├── desktop/     # デスクトップアプリ
├── mobile/      # モバイルアプリ
└── relay-server/  # リレーサーバー
```

各パッケージは独立して開発可能です。

## コミュニティ

- GitHub Discussions: 質問や議論
- GitHub Issues: バグ報告、機能リクエスト
- Pull Requests: コード貢献

## ライセンス

コントリビューションはMITライセンスの下で提供されます。

## 質問がある場合

わからないことがあれば、遠慮なくIssueで質問してください。
