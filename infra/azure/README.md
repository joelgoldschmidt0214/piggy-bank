# Azure Infrastructure - Terraform Configuration

## Overview

Azure Container Apps でバックエンドをホスティングする設定。

## Prerequisites

- **mise** (Terraform 1.14 を自動管理)
- **Azure CLI** (ローカル開発用)
- **Azure サブスクリプション**
- **GitHub OIDC 設定** (CI/CD用)

> **Note**: Terraform は `mise.toml` で管理されており、`mise install` で自動インストールされます。

## Setup

### 1. ツールチェーンの準備

```bash
# プロジェクトルートで実行
mise install  # Terraform 1.14 等が自動インストール
```

### 2. Azure CLI ログイン（ローカル開発用）

```bash
az login
az account set --subscription "your-subscription-id"
```

### 3. Terraform 初期化

```bash
# プロジェクトルートから実行推奨
just infra-init

# または手動実行
cd infra/azure
terraform init
```

### 4. 変数ファイル作成

```bash
cp terraform.tfvars.example terraform.tfvars
vim terraform.tfvars
```

### 5. プランの確認と適用

```bash
# プロジェクトルートから実行推奨
just infra-plan   # プラン確認
just infra-apply  # リソース作成

# または手動実行
cd infra/azure
terraform plan
terraform apply
```

## Resources Created

- **Resource Group**: リソースグループ
- **Container Registry**: Docker イメージ格納
- **Container Apps Environment**: コンテナ実行環境
- **Container App**: バックエンド API
- **Log Analytics Workspace**: ログ監視

## Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `location` | Azure リージョン | Yes |
| `environment` | 環境名 (dev/staging/prod) | Yes |
| `container_image` | Docker イメージ名 | Yes |

## Outputs

- `container_app_url`: バックエンド API の URL
- `container_registry_login_server`: ACR のログインサーバー

## Commands

```bash
# 初期化
just infra-init

# プラン確認
just infra-plan

# 適用
just infra-apply

# 削除
just infra-destroy
```

## CI/CD Integration

GitHub Actions でデプロイ自動化（OIDC認証 + Azure Blob Storage state管理）:

### 1. Azure側の設定

```bash
# Federated Identity Credential の作成（GitHub OIDC用）
az ad app federated-credential create \
  --id <APP_ID> \
  --parameters '{"name":"github-oidc","issuer":"https://token.actions.githubusercontent.com","subject":"repo:joelgoldschmidt0214/piggy-bank:ref:refs/heads/main","audiences":["api://AzureADTokenExchange"]}'

# Storage Account 作成（Terraform state管理用）
az storage account create \
  --name <STORAGE_ACCOUNT_NAME> \
  --resource-group <RESOURCE_GROUP> \
  --location japaneast \
  --sku Standard_LRS

az storage container create \
  --name tfstate \
  --account-name <STORAGE_ACCOUNT_NAME>
```

### 2. GitHub Secrets に登録

- `AZURE_CLIENT_ID`: Azure AD App の Application (client) ID
- `AZURE_TENANT_ID`: Azure AD の Tenant ID
- `AZURE_SUBSCRIPTION_ID`: Azure サブスクリプション ID

### 3. 自動実行

`.github/workflows/infra.yml` が以下のタイミングで自動実行：

- `infra/azure/**` への変更プッシュ時
- 手動トリガー（workflow_dispatch）

> **Note**: OIDC認証により、Service Principal のシークレット管理が不要になり、セキュリティが向上します。

## Cost Estimation

- Container Apps: 従量課金（CPU/メモリ使用量による）
- Container Registry: Basic tier (~¥500/月)
- Log Analytics: 従量課金（ログ量による）

**概算**: 月額 ¥1,000-5,000（小規模利用の場合）

## Cleanup

```bash
terraform destroy
```
