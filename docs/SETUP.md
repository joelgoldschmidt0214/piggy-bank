# セットアップガイド

## 前提条件

以下のツールがインストールされていることを確認してください。

### 必須ツール

| ツール | バージョン | インストール方法 |
|--------|-----------|----------------|
| Git | 最新 | [git-scm.com](https://git-scm.com/) |
| Docker Desktop | 最新 | [docker.com](https://www.docker.com/) |
| mise | 最新 | `curl https://mise.jdx.dev/install.sh \| sh` |
| Just | 最新 | `brew install just` (macOS) / [just.systems](https://just.systems/man/en/) |

> **Note**: Node.js (24.13), pnpm (10.28), Python (3.13), uv, Terraform (1.14) は `mise.toml` で自動管理されるため、個別インストール不要です。

### オプション

- **Azure CLI**: Azure デプロイ時のみ必要
- **actionlint, shellcheck**: CI/CD構成チェック用（`check-infra`で使用）

---

## 🚀 クイックスタート（5分）

### 1. リポジトリクローン

```bash
git clone https://github.com/joelgoldschmidt0214/piggy-bank.git
cd piggy-bank
```

### 2. 完全セットアップ（このコマンドだけでOK）

```bash
just init
```

このコマンドは以下を実行します：

- Frontend依存関係インストール（pnpm）
- Backend依存関係インストール（uv）
- 環境変数テンプレートコピー（.env.example → .env）
- Docker起動（PostgreSQL + Supabase Studio）

### 3. 環境変数設定

以下のファイルを編集して必要な値を設定：

```bash
# ルート
vim .env

# Frontend
vim frontend/.env.local

# Backend
vim backend/.env
```

**最低限必要な設定:**

- `OPENAI_API_KEY`: OpenAI API キー
- `GOOGLE_CLIENT_ID`: Google OAuth クライアントID
- `GOOGLE_CLIENT_SECRET`: Google OAuth クライアントシークレット

### 4. データベースマイグレーション

```bash
just db-upgrade
```

### 5. 開発サーバー起動

```bash
just dev
```

これで以下のサービスが起動します：

- **Frontend**: <http://localhost:3000>
- **Backend**: <http://localhost:8000>
- **Backend API Docs**: <http://localhost:8000/docs>
- **Supabase Studio**: <http://localhost:3001>

---

## 📋 詳細セットアップ

> **Note**: 通常は `just init` + `just dev` で完了します。以下は個別に実行する場合の参考情報です。

### Frontend セットアップ

```bash
cd frontend

# 依存関係インストール（miseが自動的にNode.js 24.13 + pnpm 10.28を使用）
pnpm install

# 環境変数設定
cp .env.local.example .env.local
vim .env.local

# 開発サーバー起動
pnpm dev
```

#### 必要な環境変数

```bash
# .env.local
NEXT_PUBLIC_API_URL=http://localhost:8000
BETTER_AUTH_SECRET=your-secret-key
BETTER_AUTH_URL=http://localhost:3000
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
```

### Backend セットアップ

```bash
cd backend

# Python 3.13 の確認（miseで管理されているuvが使用）
python --version  # 3.13.x

# 依存関係インストール（uvが自動的に仮想環境作成 + パッケージインストール）
uv sync

# 環境変数設定
cp .env.example .env
vim .env

# データベースマイグレーション
uv run alembic upgrade head

# 開発サーバー起動（FastAPI devモード推奨 - 2026年標準）
uv run fastapi dev app/main.py --host 0.0.0.0 --port 8000
```

#### 必要な環境変数

```bash
# .env
DATABASE_URL=postgresql+asyncpg://postgres:postgres@localhost:5432/piggy_bank
SECRET_KEY=your-super-secret-key
OPENAI_API_KEY=sk-your-openai-api-key
CORS_ORIGINS=http://localhost:3000
```

### Database セットアップ

#### ローカル開発（Docker Compose）

```bash
# PostgreSQL + Supabase Studio 起動
docker compose up -d

# ログ確認
docker compose logs -f

# 停止
docker compose down
```

#### Supabase Studio にアクセス

<http://localhost:3001>

**デフォルト接続情報:**

- Host: localhost
- Port: 5432
- Database: piggy_bank
- User: postgres
- Password: postgres

---

## 🔐 Google OAuth 設定

### 1. Google Cloud Console でプロジェクト作成

<https://console.cloud.google.com/>

### 2. OAuth 2.0 クライアントID作成

1. 「APIとサービス」→「認証情報」に移動
2. 「認証情報を作成」→「OAuth クライアント ID」
3. アプリケーションの種類: **ウェブアプリケーション**
4. 承認済みのリダイレクトURI:
   - `http://localhost:3000/api/auth/callback/google`（開発環境）
   - `https://yourdomain.com/api/auth/callback/google`（本番環境）

### 3. クライアントIDとシークレットをコピー

`frontend/.env.local` に設定：

```bash
GOOGLE_CLIENT_ID=your-google-client-id-here.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-google-client-secret-here
```

---

## 🧪 テスト実行

### Frontend テスト

```bash
cd frontend

# テスト実行
pnpm test

# カバレッジ付き
pnpm test:coverage

# Watch mode
pnpm test:watch
```

### Backend テスト

```bash
cd backend

# テスト実行
uv run pytest

# カバレッジ付き
uv run pytest --cov=app --cov-report=html

# 詳細表示
uv run pytest -v
```

---

## 🏗️ ビルド

### Frontend ビルド

```bash
cd frontend
pnpm build

# ビルド成果物確認
ls -la .next/
```

### Backend Docker イメージビルド

```bash
cd backend
docker build -t piggy-bank-backend:latest .

# イメージ確認
docker images | grep piggy-bank
```

---

## 🚢 デプロイ

### Frontend デプロイ（Vercel）

```bash
# Vercel CLIインストール
npm install -g vercel

# デプロイ
cd frontend
vercel --prod
```

### Backend デプロイ（Azure Container Apps）

```bash
# Azure CLIログイン
az login

# Terraform適用
cd infra/azure
terraform init
terraform apply
```

---

## 🛠️ トラブルシューティング

### ポート競合エラー

```bash
# 使用中のポート確認
lsof -i :3000  # Frontend
lsof -i :8000  # Backend
lsof -i :5432  # PostgreSQL

# プロセス終了
kill -9 <PID>
```

### Docker コンテナが起動しない

```bash
# ログ確認
docker compose logs

# コンテナ再起動
docker compose down
docker compose up -d
```

### データベース接続エラー

```bash
# PostgreSQL 起動確認
docker compose ps

# 接続テスト
psql -h localhost -U postgres -d piggy_bank -p 5432
# パスワード: postgres
```

### Node.js/pnpm バージョン不一致

```bash
# miseで正しいバージョンに自動切り替え
cd frontend
node --version  # 24.13.0 になるはず
pnpm --version  # 10.28.2 になるはず
```

### Python バージョン不一致

```bash
# uvで正しいバージョン使用
cd backend
python --version  # 3.13.x になるはず

# 再インストール
uv sync --reinstall
```

---

## 📚 追加リソース

- [プロジェクト概要](README.md)
- [アーキテクチャ設計](ARCHITECTURE.md)
- [API仕様書](API.md)
- [Contributing Guide](../CONTRIBUTING.md)

---

## 💡 開発のヒント

### VS Code 推奨拡張機能

```json
{
  "recommendations": [
    "dbaeumer.vscode-eslint",
    "esbenp.prettier-vscode",
    "bradlc.vscode-tailwindcss",
    "ms-python.python",
    "ms-python.vscode-pylance",
    "charliermarsh.ruff",
    "hashicorp.terraform"
  ]
}
```

### ホットリロード設定

両方のサーバーは自動的にファイル変更を検知してリロードします：

- **Frontend**: Fast Refresh有効
- **Backend**: `--reload` フラグで起動

### デバッグ

**Frontend (Next.js):**

```json
// .vscode/launch.json
{
  "type": "node",
  "request": "launch",
  "name": "Next.js: debug",
  "runtimeExecutable": "pnpm",
  "runtimeArgs": ["dev"],
  "port": 9229,
  "cwd": "${workspaceFolder}/frontend"
}
```

**Backend (FastAPI):**

```json
// .vscode/launch.json
{
  "type": "python",
  "request": "launch",
  "name": "FastAPI: debug",
  "module": "uvicorn",
  "args": ["app.main:app", "--reload"],
  "cwd": "${workspaceFolder}/backend"
}
```

---

**最終更新**: 2026年1月28日
