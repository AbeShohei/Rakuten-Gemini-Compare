/*
  # 楽天商品比較アプリ - 初期スキーマ

  1. New Tables
    - `products`
      - 楽天商品情報のキャッシュテーブル
      - `item_code` (text, primary key) - 楽天商品コード
      - `item_name` (text) - 商品名
      - `item_price` (integer) - 価格
      - `item_url` (text) - 商品URL
      - `image_url` (text) - 画像URL
      - `shop_name` (text) - ショップ名
      - `review_average` (decimal) - レビュー平均
      - `review_count` (integer) - レビュー数
      - `description` (text) - 商品説明
      - `cached_at` (timestamp) - キャッシュ日時

    - `comparison_history`
      - 比較履歴テーブル
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key) - ユーザーID
      - `title` (text) - 比較タイトル
      - `product_codes` (text[]) - 比較対象商品コード配列
      - `user_preferences` (jsonb) - ユーザー設定
      - `evaluation_axes` (jsonb) - 評価軸データ
      - `comparison_result` (jsonb) - 比較結果データ
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

    - `favorites`
      - お気に入り商品テーブル
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key) - ユーザーID
      - `product_code` (text, foreign key) - 商品コード
      - `memo` (text) - メモ
      - `created_at` (timestamp)

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users to read their own data
    - Add policies for product cache (public read, system write)

  3. Indexes
    - Add indexes for frequently queried columns
    - Add composite indexes for user-specific queries
*/

-- Products table (商品キャッシュ)
CREATE TABLE IF NOT EXISTS products (
  item_code text PRIMARY KEY,
  item_name text NOT NULL,
  item_price integer NOT NULL DEFAULT 0,
  item_url text NOT NULL,
  image_url text,
  shop_name text,
  review_average decimal(3,2) DEFAULT 0.0,
  review_count integer DEFAULT 0,
  description text,
  cached_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Comparison history table (比較履歴)
CREATE TABLE IF NOT EXISTS comparison_history (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title text NOT NULL DEFAULT '商品比較',
  product_codes text[] NOT NULL,
  user_preferences jsonb,
  evaluation_axes jsonb,
  comparison_result jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Favorites table (お気に入り)
CREATE TABLE IF NOT EXISTS favorites (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  product_code text NOT NULL REFERENCES products(item_code) ON DELETE CASCADE,
  memo text,
  created_at timestamptz DEFAULT now(),
  UNIQUE(user_id, product_code)
);

-- Enable Row Level Security
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE comparison_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE favorites ENABLE ROW LEVEL SECURITY;

-- RLS Policies for products (public read, system write)
CREATE POLICY "Products are viewable by everyone"
  ON products
  FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Products can be inserted by service role"
  ON products
  FOR INSERT
  TO service_role
  WITH CHECK (true);

CREATE POLICY "Products can be updated by service role"
  ON products
  FOR UPDATE
  TO service_role
  USING (true);

-- RLS Policies for comparison_history
CREATE POLICY "Users can view their own comparison history"
  ON comparison_history
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own comparison history"
  ON comparison_history
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own comparison history"
  ON comparison_history
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own comparison history"
  ON comparison_history
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- RLS Policies for favorites
CREATE POLICY "Users can view their own favorites"
  ON favorites
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own favorites"
  ON favorites
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own favorites"
  ON favorites
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own favorites"
  ON favorites
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_comparison_history_user_id ON comparison_history(user_id);
CREATE INDEX IF NOT EXISTS idx_comparison_history_created_at ON comparison_history(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_favorites_user_id ON favorites(user_id);
CREATE INDEX IF NOT EXISTS idx_favorites_product_code ON favorites(product_code);
CREATE INDEX IF NOT EXISTS idx_products_cached_at ON products(cached_at);

-- Functions
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers
CREATE TRIGGER update_products_updated_at
  BEFORE UPDATE ON products
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_comparison_history_updated_at
  BEFORE UPDATE ON comparison_history
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();