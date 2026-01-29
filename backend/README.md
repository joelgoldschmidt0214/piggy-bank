# Piggy Bank Backend

FastAPI-based backend for the Piggy Bank financial tracking application.

## Features

- Async SQLAlchemy with PostgreSQL
- BetterAuth integration for user authentication
- OpenAI API integration for financial advice
- Alembic migrations for database management
- RESTful API with automatic OpenAPI documentation

## Quick Start

```bash
# プロジェクトルートから実行推奨
cd /path/to/piggy-bank
just init           # 完全セットアップ（初回のみ）
just dev-backend    # Backend開発サーバー起動
```

## Development

個別にコマンドを実行する場合：

```bash
cd backend

# 依存関係インストール（uvが自動的に仮想環境作成）
uv sync

# 開発サーバー起動（FastAPI devモード - 2026年推奨）
uv run fastapi dev app/main.py --host 0.0.0.0 --port 8000

# Migrationの作成と適用
uv run alembic revision --autogenerate -m "add users table"
uv run alembic upgrade head

# テスト実行
uv run pytest -v --cov=app

# Lint & Format
uv run ruff check .
uv run ruff format .
```

## Technology Stack

- **Framework**: FastAPI
- **Database**: PostgreSQL 15 with SQLAlchemy Async
- **ORM**: SQLAlchemy 2.0+
- **Migrations**: Alembic
- **Validation**: Pydantic v2
- **AI**: OpenAI API (gpt-4o-mini)
- **Authentication**: BetterAuth
- **Package Manager**: uv (mise で管理)
- **Python Version**: 3.13 (mise で管理)

## Environment Variables

See `.env.example` for required environment variables.

```bash
# 環境変数のコピー
cp .env.example .env
vim .env
```

## Project Structure

```
backend/
├── app/
│   ├── api/v1/          # API endpoints
│   ├── core/            # Config, DB, Security
│   ├── models/          # SQLAlchemy models
│   ├── schemas/         # Pydantic schemas
│   ├── services/        # Business logic
│   └── main.py          # FastAPI app
├── alembic/             # Database migrations
├── tests/               # Test files
└── pyproject.toml       # uv project config
```
