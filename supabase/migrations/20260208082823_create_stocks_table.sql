/*
  # 創建股票資料表

  1. 新增資料表
    - `stocks`
      - `id` (uuid, primary key) - 股票ID
      - `code` (text) - 股票代碼
      - `name` (text) - 股票名稱
      - `price` (numeric) - 股價
      - `category` (text) - 股票類別（科技、金融、製造、能源等）
      - `created_at` (timestamptz) - 創建時間

  2. 安全性
    - 啟用 RLS
    - 新增政策允許所有人讀取股票資料（公開資料）

  3. 範例資料
    - 插入一些範例股票資料供測試使用
*/

-- 創建股票資料表
CREATE TABLE IF NOT EXISTS stocks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  code text NOT NULL UNIQUE,
  name text NOT NULL,
  price numeric NOT NULL CHECK (price >= 0),
  category text NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- 啟用 RLS
ALTER TABLE stocks ENABLE ROW LEVEL SECURITY;

-- 允許所有人讀取股票資料（公開資訊）
CREATE POLICY "Anyone can read stocks"
  ON stocks
  FOR SELECT
  TO public
  USING (true);

-- 插入範例股票資料
INSERT INTO stocks (code, name, price, category) VALUES
  ('2330', '台積電', 580.00, '科技'),
  ('2317', '鴻海', 125.50, '科技'),
  ('2454', '聯發科', 1050.00, '科技'),
  ('2882', '國泰金', 58.20, '金融'),
  ('2891', '中信金', 32.15, '金融'),
  ('2886', '兆豐金', 38.90, '金融'),
  ('2303', '聯電', 48.35, '科技'),
  ('2002', '中鋼', 28.75, '製造'),
  ('1301', '台塑', 95.80, '製造'),
  ('2308', '台達電', 385.00, '科技'),
  ('1303', '南亞', 72.50, '製造'),
  ('2412', '中華電', 120.00, '電信'),
  ('3008', '大立光', 2580.00, '科技'),
  ('2881', '富邦金', 78.50, '金融'),
  ('6505', '台塑化', 98.20, '製造')
ON CONFLICT (code) DO NOTHING;
