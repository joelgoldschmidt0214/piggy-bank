# Piggy Bank - Justfile
# Optimized for Mise, uv, Next.js 16, and Terraform 1.14 (2026-01-29)

set shell := ["bash", "-uc"]

# Default: ヘルプ表示
default:
    @just --list

# ============================================
# Setup & Installation
# ============================================

# 全環境の初期化（mise install を含む）
init:
    @echo "🚀 ツールチェーンの同期 (mise)..."
    mise install
    @echo "📦 依存関係のインストール..."
    just install-deps
    @echo "🔐 環境変数の設定..."
    just setup-env
    @echo "🐳 Docker コンテナの起動..."
    just docker-up
    @echo "✅ セットアップ完了！"

# 依存関係のクリーンなインストール
install-deps:
    cd frontend && pnpm install
    cd backend && uv sync --frozen

# 環境変数テンプレートのコピー
setup-env:
    @[ -f .env ] || (cp .env.example .env && echo "✓ .env created")
    @[ -f frontend/.env.local ] || (cp frontend/.env.local.example frontend/.env.local && echo "✓ frontend/.env.local created")
    @[ -f backend/.env ] || (cp backend/.env.example backend/.env && echo "✓ backend/.env created")

# ============================================
# Development
# ============================================

# 開発サーバー一括起動
dev:
    @echo "🌐 開発サーバーを起動中..."
    just dev-frontend & just dev-backend

# Frontend (Next.js 16)
dev-frontend:
    cd frontend && pnpm dev

# Backend (FastAPI dev mode - Recommended for 2026)
dev-backend:
    cd backend && uv run fastapi dev app/main.py --host 0.0.0.0 --port 8000

# ============================================
# Docker / Supabase Local
# ============================================

docker-up:
    docker compose up -d

docker-down:
    docker compose down

docker-logs:
    docker compose logs -f

# ============================================
# Database (Alembic)
# ============================================

# Migration作成
db-migrate MESSAGE:
    cd backend && uv run alembic revision --autogenerate -m "{{MESSAGE}}"

# Migration適用
db-upgrade:
    cd backend && uv run alembic upgrade head

# Migration戻し
db-downgrade:
    cd backend && uv run alembic downgrade -1

# ============================================
# Quality & Security (CI/CD Local Simulation)
# ============================================

# 全ての静的解析を実行 (Push前に推奨)
check-all: lint typecheck security-scan check-infra

# コードフォーマット (ruff & prettier/eslint)
format:
    cd backend && uv run ruff format .
    cd backend && uv run ruff check . --fix
    cd frontend && pnpm format

# Lint実行
lint:
    cd backend && uv run ruff check .
    cd frontend && pnpm lint

# 型チェック
typecheck:
    cd frontend && pnpm typecheck

# インフラ・CI構成のチェック (Miseで導入したツールを使用)
check-infra:
    @echo "🔍 GitHub Actions 構文チェック..."
    actionlint .github/workflows/*.yml
    @echo "🔍 Shell Script チェック..."
    shellcheck Justfile

# セキュリティスキャン (trivy.yaml の設定を使用)
security-scan:
    @echo "🔒 Trivy セキュリティスキャン (Vulnerability, Config, Secret)..."
    trivy fs .

# 依存関係の脆弱性監査 (security.yml の各ジョブに相当)
security-audit:
    @echo "🔒 Frontend 監査..."
    cd frontend && pnpm audit
    @echo "🔒 Backend 監査 (pip-audit via uv)..."
    cd backend && uv tool run pip-audit --require-hashes --disable-pip

# ============================================
# Infrastructure (Terraform 1.14)
# ============================================

infra-init:
    cd infra/azure && terraform init

infra-plan:
    cd infra/azure && terraform plan

infra-apply:
    cd infra/azure && terraform apply

# ============================================
# Testing
# ============================================

test:
    just test-frontend
    just test-backend

test-frontend:
    cd frontend && pnpm test

test-backend:
    cd backend && uv run pytest -v --cov=app

# ============================================
# Utilities
# ============================================

# インストールされているツールのバージョン一覧
info:
    @echo "📊 Tool Versions (via mise):"
    @mise ls
    @echo ""
    @echo "📊 Cloud & Infra:"
    @az version | head -n 5
    @terraform version | head -n 1
    @trivy --version | head -n 1

# 完全クリーンアップ
clean:
    docker compose down -v
    rm -rf frontend/.next frontend/node_modules
    rm -rf backend/.venv backend/.pytest_cache
    find . -type d -name "__pycache__" -exec rm -rf {} +
