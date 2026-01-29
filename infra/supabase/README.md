# Supabase Local Development Setup

## Prerequisites

- Docker & Docker Compose
- Supabase CLI (optional)

## Getting Started

### 1. Docker Compose で起動

```bash
# ルートディレクトリから
docker compose up -d

# または Justfile 経由
just docker-up
```

### 2. Supabase Studio にアクセス

<http://localhost:3001>

### 3. PostgreSQL 接続情報

- **Host**: localhost
- **Port**: 5432
- **Database**: piggy_bank
- **User**: postgres
- **Password**: postgres

### 4. Connection String

```
postgresql://postgres:postgres@localhost:5432/piggy_bank
```

## Web UI での手動設定

### Google OAuth プロバイダー追加

1. Supabase Studio (<http://localhost:3001>) にアクセス
2. Authentication > Providers に移動
3. Google を有効化
4. Google Cloud Console で取得した以下を設定:
   - Client ID
   - Client Secret
   - Authorized redirect URIs: `http://localhost:3000/api/auth/callback/google`

### Row Level Security (RLS) 設定

```sql
-- Users テーブル
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own data" ON users
  FOR SELECT USING (auth.uid()::text = auth_id);

-- Transactions テーブル
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own transactions" ON transactions
  FOR SELECT USING (
    user_id IN (SELECT id FROM users WHERE auth_id = auth.uid()::text)
  );

CREATE POLICY "Users can insert own transactions" ON transactions
  FOR INSERT WITH CHECK (
    user_id IN (SELECT id FROM users WHERE auth_id = auth.uid()::text)
  );

CREATE POLICY "Users can update own transactions" ON transactions
  FOR UPDATE USING (
    user_id IN (SELECT id FROM users WHERE auth_id = auth.uid()::text)
  );

CREATE POLICY "Users can delete own transactions" ON transactions
  FOR DELETE USING (
    user_id IN (SELECT id FROM users WHERE auth_id = auth.uid()::text)
  );
```

## Supabase CLI (Optional)

### Installation

```bash
# macOS
brew install supabase/tap/supabase

# Linux
curl -fsSL https://github.com/supabase/cli/releases/latest/download/supabase_linux_amd64.tar.gz | tar -xz && sudo mv supabase /usr/local/bin/
```

### Usage

```bash
# プロジェクト初期化
supabase init

# ローカル開発環境起動
supabase start

# マイグレーション作成
supabase migration new create_users_table

# マイグレーション適用
supabase db push
```

## Production Setup

本番環境では Supabase Cloud (<https://supabase.com>) を使用:

1. Supabase ダッシュボードで新規プロジェクト作成
2. 接続文字列を取得
3. 環境変数に設定:
   - `DATABASE_URL`
   - `SUPABASE_URL`
   - `SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`

## Troubleshooting

### ポート競合エラー

```bash
# 既存のコンテナを停止
docker compose down

# ポート確認
lsof -i :5432
lsof -i :3001
```

### データリセット

```bash
# ボリュームを含めて削除
docker compose down -v

# 再起動
docker compose up -d
```
