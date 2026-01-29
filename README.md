# Piggy Bank 🐷💰

モダンなフルスタック家計簿アプリ。AI分析機能付き。

## Tech Stack

### Frontend

- **Next.js 16** (App Router)
- **TypeScript**
- **Tailwind CSS** + **Shadcn/UI**
- **BetterAuth** (Google OAuth)

### Backend

- **Python 3.13**
- **FastAPI**
- **SQLAlchemy** (Async)
- **Alembic** (Migration)
- **Pydantic v2**

### Database

- **PostgreSQL** (Supabase)

### Infrastructure

- **Azure Container Apps** (Backend)
- **Azure Static Web Apps** / **Vercel** (Frontend)
- **Terraform** (IaC)
- **Docker Compose** (Local Dev)

### DevOps

- **GitHub Actions** (CI/CD)
- **Trivy** (Security Scan)
- **Renovate** (Dependency Updates)

## Prerequisites

以下のツールがインストールされていることを確認してください：

- **[mise](https://mise.jdx.dev/)** - ツール一元管理（必須）
- **[Docker Engine](https://docs.docker.com/engine/install/)** - ローカル開発環境（必須）

> **Note**: Node.js (24.13), pnpm (10.28), Python (3.13), uv, Terraform (1.14), Just (1.46), Azure CLI, Trivy, actionlint, shellcheck は `mise.toml` で自動管理されるため、個別インストールは不要です。

### インストール手順

```bash
# 1. mise（ツール一元管理）のインストール
curl https://mise.jdx.dev/install.sh | sh

# 2. Docker Engine のインストール
# Ubuntu/Debian の場合
curl -fsSL https://get.docker.com | sh

# その他のディストリビューションは公式ドキュメント参照
# https://docs.docker.com/engine/install/

# Docker を非rootユーザーで実行できるように設定
sudo usermod -aG docker $USER
newgrp docker

# Docker Compose がインストールされていることを確認
docker compose version
```

## Quick Start

```bash
# 1. リポジトリクローン
git clone https://github.com/joelgoldschmidt0214/piggy-bank.git
cd piggy-bank

# 2. 開発ツールのインストール（Just, Node.js, Python等）
mise install

# 3. 完全セットアップ（依存関係 + 環境変数 + Docker起動）
just init

# 4. 開発サーバー起動（Frontend + Backend 同時起動）
just dev
```

**アクセス先:**
- Frontend: http://localhost:3000
- Backend API: http://localhost:8000/docs
- Supabase Studio: http://localhost:3001

### 個別起動

```bash
# Frontend のみ起動 (http://localhost:3000)
just dev-frontend

# Backend のみ起動 (http://localhost:8000)
just dev-backend

# Docker (PostgreSQL + Supabase Studio) のみ起動
just docker-up
```

## Available Commands

すべての利用可能なコマンドを表示：

```bash
just
```

主要コマンド：

| コマンド | 説明 |
|---------|------|
| `just init` | 完全初期化（依存関係 + 環境変数 + Docker起動） |
| `just dev` | 開発サーバー起動（両方） |
| `just dev-frontend` | Frontend開発サーバー |
| `just dev-backend` | Backend開発サーバー |
| `just docker-up` | Docker起動 |
| `just docker-down` | Docker停止 |
| `just db-migrate MESSAGE` | Migration作成 |
| `just db-upgrade` | Migration実行 |
| `just test` | テスト実行（両方） |
| `just lint` | Lint実行 |
| `just format` | コードフォーマット |
| `just check-all` | 全静的解析（Push前推奨） |
| `just security-scan` | Trivyセキュリティスキャン |
| `just clean` | クリーンアップ |
| `just info` | インストール済みツールバージョン表示 |

## Project Structure

```txt
piggy-bank/
├── frontend/          # Next.js アプリケーション
├── backend/           # FastAPI アプリケーション
├── infra/             # Terraform IaC
├── docs/              # ドキュメント
├── .github/           # GitHub Actions workflows
├── mise.toml          # ツールバージョン管理
├── Justfile           # タスクランナー設定
└── docker-compose.yml # ローカル開発環境
```

詳細は [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) を参照。

## Environment Variables

環境変数は以下のテンプレートから作成：

- **ルート**: `.env.example` → `.env`
- **Frontend**: `frontend/.env.local.example` → `frontend/.env.local`
- **Backend**: `backend/.env.example` → `backend/.env`

`just init` で自動的にコピーされます。

## Development Workflow

1. **機能開発**: ブランチ切って開発 (`feature/xxx`)
2. **Lint & Test**: `just check-all`
3. **Migration**: `just db-migrate "add users table"`
4. **Push**: GitHub に push
5. **CI/CD**: GitHub Actions が自動テスト・デプロイ

## Deployment

- **Frontend**: Azure Static Web Apps / Vercel
- **Backend**: Azure Container Apps
- **Infrastructure**: Terraform (Azure, OIDC認証 + Blob Storage state管理)

詳細は [docs/SETUP.md](docs/SETUP.md) を参照。

## Security

- **Trivy**: 脆弱性スキャン（`just security-scan` または GitHub Actions）
- **Renovate**: 依存関係自動更新
- **BetterAuth**: セキュアな認証（Google OAuth）
- **HTTPS**: すべての通信を暗号化

## License

MIT
See [LICENSE](LICENSE) for details.
