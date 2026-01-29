# Piggy Bank Monorepo - Full Stack Web App Plan

**日付**: 2026年1月28日

## プロジェクト概要

Supabase無料枠 + BetterAuth + Next.js + Python 3.13 + Justfile + Docker Compose を統合した、実用的なフルスタックモノレポ構成。

### 技術スタック

**Frontend**
- Next.js 16 (App Router)
- TypeScript
- Tailwind CSS + Shadcn/UI
- BetterAuth (Google OAuth)
- mise (Node 24.x + pnpm 10.28.x)

**Backend**
- Python 3.13 (uv管理)
- FastAPI
- SQLAlchemy (Async)
- Alembic (migration)
- Pydantic v2

**Database**
- PostgreSQL (Supabase無料枠)

**Infrastructure**
- Azure Container Apps (Terraform管理)
- Supabase (Web UI手動設定 + 部分的Terraform)
- Docker Compose (ローカル開発)

**DevOps**
- GitHub Actions (path分離: frontend/backend/infra/security)
- Trivy (脆弱性スキャン)
- Renovate (依存関係更新)
- Justfile (タスクランナー)

---

## ディレクトリ構造

```
piggy-bank/
├── .github/
│   └── workflows/
│       ├── frontend.yml          # Frontend CI/CD (paths: frontend/**)
│       ├── backend.yml           # Backend CI/CD (paths: backend/**)
│       ├── security.yml          # Trivy + Renovate定期スキャン
│       └── infra.yml             # Terraform plan/apply (paths: infra/**)
│
├── frontend/
│   ├── src/
│   │   ├── app/                  # Next.js App Router
│   │   │   ├── (auth)/           # 認証関連ルート
│   │   │   │   ├── login/
│   │   │   │   └── callback/    # OAuth callback
│   │   │   ├── (dashboard)/     # 認証後メイン画面
│   │   │   │   ├── layout.tsx
│   │   │   │   ├── page.tsx
│   │   │   │   └── transactions/
│   │   │   ├── api/              # Route handlers (必要に応じて)
│   │   │   ├── layout.tsx
│   │   │   └── page.tsx
│   │   ├── components/           # UIコンポーネント
│   │   │   ├── ui/               # Shadcn/UI (button, card等)
│   │   │   ├── forms/
│   │   │   └── layout/
│   │   ├── lib/
│   │   │   ├── auth.ts           # BetterAuth設定
│   │   │   ├── api-client.ts    # Backend API通信
│   │   │   └── utils.ts
│   │   └── styles/
│   │       └── globals.css       # Tailwind CSS
│   ├── public/
│   ├── .env.local.example
│
├── mise.toml                      # Node/pnpm/terraform/uv を一元管理
│   ├── package.json
│   ├── tsconfig.json
│   ├── next.config.js
│   ├── tailwind.config.ts
│   └── .env.local.example
│
├── backend/
│   ├── app/
│   │   ├── api/
│   │   │   └── v1/
│   │   │       ├── __init__.py
│   │   │       ├── transactions.py  # Transaction endpoints
│   │   │       ├── users.py         # User endpoints
│   │   │       └── analysis.py      # AI分析エンドポイント
│   │   ├── core/
│   │   │   ├── __init__.py
│   │   │   ├── config.py         # Settings (Pydantic v2)
│   │   │   ├── security.py       # JWT/Session検証
│   │   │   └── database.py       # AsyncSession設定
│   │   ├── models/
│   │   │   ├── __init__.py
│   │   │   ├── user.py
│   │   │   └── transaction.py
│   │   ├── schemas/              # Pydantic schemas
│   │   │   ├── __init__.py
│   │   │   ├── user.py
│   │   │   └── transaction.py
│   │   ├── services/
│   │   │   ├── __init__.py
│   │   │   ├── ai_advisor.py    # OpenAI API呼び出し
│   │   │   └── analytics.py
│   │   └── main.py               # FastAPI app entry
│   ├── alembic/                  # DB migration
│   │   ├── versions/
│   │   ├── env.py
│   │   └── alembic.ini
│   ├── tests/
│   │   ├── __init__.py
│   │   ├── test_api.py
│   │   └── test_services.py
│   ├── .python-version           # 3.13
│   ├── pyproject.toml            # uv管理、依存関係
│   ├── uv.lock
│   └── .env.example
│
├── infra/
│   ├── azure/
│   │   ├── main.tf               # Azure Container Apps等
│   │   ├── variables.tf
│   │   ├── outputs.tf
│   │   └── modules/
│   │       ├── container-apps/
│   │       └── storage/
│   ├── supabase/
│   │   ├── README.md             # Web UI設定手順
│   │   ├── config.toml           # Supabase CLI local dev設定
│   │   └── migrations/           # Supabase migration (SQL)
│   ├── terraform.tfvars.example
│   └── .terraform-version        # Terraform 1.7+
│
├── docs/
│   ├── README.md                 # プロジェクト全体概要
│   ├── ARCHITECTURE.md           # アーキテクチャ図・説明
│   ├── SETUP.md                  # 環境構築手順
│   └── API.md                    # API仕様書
│
├── .github/
│   └── dependabot.yml            # (Renovateと併用可)
│
├── Justfile                       # タスクランナー
├── docker-compose.yml             # Supabase local dev
├── .gitignore
├── .env.example                   # 全体共通環境変数テンプレート
├── .renovaterc.json               # Renovate設定
├── trivy.yaml                     # Trivy設定
└── README.md                      # クイックスタートガイド
```

---

## 主要ファイルの初期構成

### Justfile (タスクランナー)

```justfile
# Default: ヘルプ表示
default:
    @just --list

# 初回セットアップ（全環境）
init:
    @echo "🚀 初期化を開始..."
    just install-deps
    just setup-env
    just docker-up
    @echo "✅ セットアップ完了！ 'just dev' で開発開始"

# 依存関係インストール
install-deps:
    @echo "📦 Frontend依存関係インストール..."
    cd frontend && pnpm install
    @echo "🐍 Backend依存関係インストール..."
    cd backend && uv sync

# 環境変数設定
setup-env:
    @echo "🔐 環境変数テンプレートをコピー..."
    cp .env.example .env
    cp frontend/.env.local.example frontend/.env.local
    cp backend/.env.example backend/.env

# Docker起動（Supabase local）
docker-up:
    docker compose up -d

# Docker停止
docker-down:
    docker compose down

# 開発サーバー起動（両方同時）
dev:
    @echo "🌐 開発サーバーを起動..."
    just dev-frontend & just dev-backend

# Frontend開発サーバー
dev-frontend:
    cd frontend && pnpm dev

# Backend開発サーバー
dev-backend:
    cd backend && uv run uvicorn app.main:app --reload --host 0.0.0.0 --port 8000

# DB migration作成
db-migrate-create MESSAGE:
    cd backend && uv run alembic revision --autogenerate -m "{{MESSAGE}}"

# DB migration実行
db-migrate-up:
    cd backend && uv run alembic upgrade head

# DB migration ロールバック
db-migrate-down:
    cd backend && uv run alembic downgrade -1

# テスト実行
test:
    cd frontend && pnpm test
    cd backend && uv run pytest

# Lint & Format
lint:
    cd frontend && pnpm lint
    cd backend && uv run ruff check .

format:
    cd frontend && pnpm format
    cd backend && uv run ruff format .

# セキュリティスキャン (Trivy)
security-scan:
    trivy fs --severity HIGH,CRITICAL .

# クリーンアップ
clean:
    rm -rf frontend/node_modules frontend/.next
    rm -rf backend/.venv backend/__pycache__
    docker compose down -v
```

### .renovaterc.json (Renovate設定)

```json
{
  "$schema": "https://docs.renovatebot.com/renovate-schema.json",
  "extends": ["config:base"],
  "packageRules": [
    {
      "matchPaths": ["frontend/**"],
      "groupName": "Frontend dependencies"
    },
    {
      "matchPaths": ["backend/**"],
      "groupName": "Backend dependencies"
    }
  ],
  "vulnerabilityAlerts": {
    "enabled": true
  },
  "lockFileMaintenance": {
    "enabled": true,
    "schedule": ["before 3am on Monday"]
  }
}
```

### docker-compose.yml (Supabase local dev)

```yaml
version: '3.8'

services:
  postgres:
    image: supabase/postgres:15.1.0.117
    ports:
      - "5432:5432"
    environment:
      POSTGRES_PASSWORD: postgres
      POSTGRES_DB: piggy_bank
    volumes:
      - postgres_data:/var/lib/postgresql/data

  supabase-studio:
    image: supabase/studio:20231123-64a766a
    ports:
      - "3001:3000"
    environment:
      SUPABASE_URL: http://localhost:8000
      SUPABASE_ANON_KEY: your-anon-key

volumes:
  postgres_data:
```

### mise.toml

```toml
[tools]
node = "24.13.0"
pnpm = "10.28.2"
terraform = "1.14.4"
uv = "latest"
```

### backend/.python-version

```
3.13
```

### trivy.yaml (セキュリティスキャン設定)

```yaml
severity:
  - CRITICAL
  - HIGH
  - MEDIUM

vulnerability:
  type:
    - os
    - library

format: table
```

### .gitignore

```gitignore
# Dependencies
node_modules/
.pnp
.pnp.js

# Python
__pycache__/
*.py[cod]
*$py.class
.venv/
venv/
.python-version.bak

# Testing
coverage/
.coverage
*.cover
.pytest_cache/

# Next.js
.next/
out/
build/
dist/

# Environment
.env
.env.local
.env.*.local
*.env

# IDEs
.vscode/
.idea/
*.swp
*.swo
*~

# OS
.DS_Store
Thumbs.db

# Terraform
.terraform/
*.tfstate
*.tfstate.*
.terraform.lock.hcl

# Logs
logs/
*.log
npm-debug.log*
yarn-debug.log*
yarn-error.log*

# Database
*.db
*.sqlite
postgres_data/

# Docker
.docker/
```

---

## アーキテクチャ設計のポイント

### 1. 認証フロー (BetterAuth + Google OAuth)

```
User → Next.js → BetterAuth → Google OAuth → Callback → Cookie Session
                                                ↓
                                        Backend (FastAPI)
                                        JWT検証 + User取得
```

- **Frontend**: BetterAuth が Google OAuth を処理し、Cookieにセッショントークン保存
- **Backend**: FastAPI の Dependency Injection でセッション検証、`get_current_user()` で認証済みユーザー取得
- **セキュリティ**: CSRF対策、HttpOnly Cookie、Secure flag有効化

### 2. データフロー

```
Next.js Server Actions → FastAPI API (v1/) → SQLAlchemy (Async) → PostgreSQL (Supabase)
                                     ↓
                              OpenAI API (AI分析)
```

- **非同期処理**: FastAPI + SQLAlchemy Async で同時接続性能最大化
- **型安全性**: Pydantic schemas で入出力バリデーション
- **トランザクション**: SQLAlchemy sessionでACID保証

### 3. デプロイメント

```
GitHub Actions (on push to main)
  ↓
  ├─ Frontend: Build → Azure Static Web Apps / Vercel
  ├─ Backend: Docker Build → Azure Container Apps
  └─ Infra: Terraform Apply → Azure Resources
```

- **CI/CD**: path分離で変更箇所のみビルド・デプロイ
- **セキュリティ**: Trivy で脆弱性スキャン、Renovate で自動更新
- **環境**: dev/staging/prod を Terraform workspace で分離

---

## 残課題 (Further Considerations)

### 1. BetterAuth のセットアップ詳細
- `frontend/src/lib/auth.ts` で Google OAuth設定が必要
- Supabase Auth API との連携方法（JWTトークン検証など）を明確化

### 2. Supabase Terraform の適用範囲
- Project作成のみTerraformで、Auth設定（Google OAuthプロバイダ追加）はWeb UI手動でOK
- どこまで自動化するか要検討

### 3. CI/CDのデプロイ先
- Frontend: Azure Static Web Apps or Vercel？
- Backend: Azure Container Apps確定
- コスト・パフォーマンス比較が必要

### 4. AI機能のAPI Key管理
- OpenAI API Keyは Azure Key Vault保存 or GitHub Secrets？
- ローカル開発時は `.env` 管理

### 5. 初期DBスキーマ
- Users/Transactions テーブル設計を Alembic migration で管理
- または Supabase Web UIでSQL実行

### 6. マネタイズ実装
- Stripe連携のタイミング（MVP後？）
- Freemium機能の実装範囲（AI分析回数制限など）

---

## 次のステップ

1. **プロジェクト初期化**: Justfile, .gitignore, README.md等の基本ファイル作成
2. **Frontend セットアップ**: Next.js 15 + BetterAuth + Shadcn/UI
3. **Backend セットアップ**: FastAPI + SQLAlchemy + Alembic
4. **Docker環境構築**: docker-compose.yml でローカルPostgreSQL起動
5. **GitHub Actions設定**: 3ワークフロー（frontend/backend/security）作成
6. **Terraform初期化**: Azure リソース定義（Container Apps等）

---

## 参考資料

- [Next.js 15 Documentation](https://nextjs.org/docs)
- [BetterAuth Documentation](https://better-auth.com)
- [FastAPI Documentation](https://fastapi.tiangolo.com)
- [SQLAlchemy Async](https://docs.sqlalchemy.org/en/20/orm/extensions/asyncio.html)
- [Supabase Documentation](https://supabase.com/docs)
- [Just Manual](https://just.systems/man/en/)
- [Trivy Documentation](https://aquasecurity.github.io/trivy/)
- [Renovate Documentation](https://docs.renovatebot.com)
