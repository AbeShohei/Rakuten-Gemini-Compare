# 楽天商品比較AI with Gemini

Gemini AIによる評価軸自動生成を特徴とする、楽天市場商品の比較分析アプリケーションです。

## 🌟 主要機能

- **商品検索・選択**: 楽天商品の検索、URL/ID入力による商品選択
- **AI評価軸生成**: Gemini AIによる商品特性に応じた評価軸の自動生成
- **比較分析・可視化**: レーダーチャートとランキングによる比較結果表示
- **履歴管理**: 過去の比較結果の保存・閲覧
- **お気に入り管理**: 商品のお気に入り登録・管理
- **認証システム**: Supabase Authによるユーザー管理

## 🛠 技術スタック

### フロントエンド
- **React 18** + **TypeScript**
- **Vite** (ビルドツール)
- **Tailwind CSS** (スタイリング)
- **Chart.js** + **react-chartjs-2** (レーダーチャート)
- **Lucide React** (アイコン)

### バックエンド
- **Supabase** (BaaS)
  - PostgreSQL Database
  - Authentication
  - Row Level Security (RLS)
  - Edge Functions

### 外部API
- **楽天商品検索API** (商品情報取得)
- **Gemini API** (AI分析)

### デプロイメント
- **Netlify** (フロントエンド)
- **Supabase** (バックエンド)

## 🗄 データベース設計

### テーブル構成

```sql
-- 商品キャッシュテーブル
products (
  item_code TEXT PRIMARY KEY,
  item_name TEXT NOT NULL,
  item_price INTEGER,
  item_url TEXT,
  image_url TEXT,
  shop_name TEXT,
  review_average DECIMAL(3,2),
  review_count INTEGER,
  description TEXT,
  cached_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ
)

-- 比較履歴テーブル
comparison_history (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id),
  title TEXT,
  product_codes TEXT[],
  user_preferences JSONB,
  evaluation_axes JSONB,
  comparison_result JSONB,
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ
)

-- お気に入りテーブル
favorites (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id),
  product_code TEXT REFERENCES products(item_code),
  memo TEXT,
  created_at TIMESTAMPTZ
)
```

## 🚀 セットアップ手順

### 1. 環境変数の設定

`.env`ファイルを作成し、以下の環境変数を設定してください：

```env
# Supabase Configuration
VITE_SUPABASE_URL=your-supabase-project-url
VITE_SUPABASE_ANON_KEY=your-supabase-anon-key

# API Keys (Edge Functions用)
RAKUTEN_APP_ID=your-rakuten-app-id
GEMINI_API_KEY=your-gemini-api-key
```

### 2. Supabaseプロジェクトの設定

1. [Supabase](https://supabase.com)でプロジェクトを作成
2. `supabase/migrations/create_initial_schema.sql`を実行してデータベースを初期化
3. Edge Functionsをデプロイ：
   ```bash
   # Supabase CLIを使用
   supabase functions deploy rakuten-search
   supabase functions deploy gemini-compare
   ```

### 3. 楽天APIキーの取得

1. [楽天RapidAPI](https://rapidapi.com/rakuten-rakuten-default/api/rakuten/)でAPIキーを取得
2. 「楽天商品検索API」の利用申請を行う

### 4. Gemini APIキーの取得

1. [Google AI Studio](https://aistudio.google.com/)でAPIキーを取得
2. Gemini 1.5 Flashモデルへのアクセスを確認

### 5. アプリケーションの起動

```bash
# 依存関係のインストール
npm install

# 開発サーバーの起動
npm run dev

# ビルド
npm run build
```

## 🌐 デプロイメント

### Netlifyでのデプロイ

1. GitHubリポジトリをNetlifyに接続
2. 環境変数を設定：
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
3. `netlify.toml`の設定を確認
4. デプロイを実行

### Supabase Edge Functionsの環境変数

Supabaseダッシュボードで以下の環境変数を設定：

```bash
RAKUTEN_APP_ID=your-rakuten-app-id
GEMINI_API_KEY=your-gemini-api-key
```

## 🔒 セキュリティ考慮事項

### Row Level Security (RLS)

- 全テーブルでRLSを有効化
- ユーザーは自分のデータのみアクセス可能
- 商品キャッシュは全ユーザーから読み取り可能

### API認証

- 楽天API: アプリケーションIDによる認証
- Gemini API: APIキーによる認証
- Edge Functions経由でAPIキーを秘匿

## 📱 主要コンポーネント

### ProductInput
- 商品の検索・選択機能
- ユーザー重視ポイントの設定

### ProductComparisonResult
- 比較結果の表示
- レーダーチャートによる可視化
- ランキング表示

### AuthModal
- ユーザー認証（ログイン・新規登録）

### HistoryModal
- 比較履歴の表示・管理

## 🧪 テスト

```bash
# ユニットテスト
npm run test

# E2Eテスト
npm run test:e2e
```

## 📄 ライセンス

MIT License

## 🤝 コントリビューション

1. Forkしてください
2. Feature branchを作成してください (`git checkout -b feature/AmazingFeature`)
3. 変更をコミットしてください (`git commit -m 'Add some AmazingFeature'`)
4. Branchにプッシュしてください (`git push origin feature/AmazingFeature`)
5. Pull Requestを作成してください

## 📞 サポート

問題や質問がある場合は、GitHubのIssuesでお知らせください。