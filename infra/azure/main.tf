terraform {
  required_version = "~> 1.14.4"

  # バックエンド設定（Azure Blob Storage）
  backend "azurerm" {
    resource_group_name  = "rg-terraform-state"
    storage_account_name = "stpiggybanktfstate" # 全世界でユニークな名前が必要
    container_name       = "tfstate"
    key                  = "prod.terraform.tfstate"

    # 2026年推奨：アクセスキーを使わず、マネージドIDやOIDCを使用
    use_oidc = true
  }

  required_providers {
    azurerm = {
      source  = "hashicorp/azurerm"
      version = "~> 4.0" # 2026年現在のメジャーバージョン
    }
  }
}

provider "azurerm" {
  features {}
  use_oidc = true
}

# Resource Group
resource "azurerm_resource_group" "main" {
  name     = "rg-piggy-bank-${var.environment}"
  location = var.location

  tags = {
    Environment = var.environment
    Project     = "piggy-bank"
    ManagedBy   = "terraform"
  }
}

# Container Registry
resource "azurerm_container_registry" "main" {
  name                = "acrpiggybank${var.environment}"
  resource_group_name = azurerm_resource_group.main.name
  location            = azurerm_resource_group.main.location
  sku                 = "Basic"
  admin_enabled       = true

  tags = azurerm_resource_group.main.tags
}

# Log Analytics Workspace
resource "azurerm_log_analytics_workspace" "main" {
  name                = "log-piggy-bank-${var.environment}"
  resource_group_name = azurerm_resource_group.main.name
  location            = azurerm_resource_group.main.location
  sku                 = "PerGB2018"
  retention_in_days   = 30

  tags = azurerm_resource_group.main.tags
}

# Container Apps Environment
resource "azurerm_container_app_environment" "main" {
  name                       = "cae-piggy-bank-${var.environment}"
  resource_group_name        = azurerm_resource_group.main.name
  location                   = azurerm_resource_group.main.location
  log_analytics_workspace_id = azurerm_log_analytics_workspace.main.id

  tags = azurerm_resource_group.main.tags
}

# Container App (Backend)
resource "azurerm_container_app" "backend" {
  name                         = "ca-piggy-bank-backend-${var.environment}"
  resource_group_name          = azurerm_resource_group.main.name
  container_app_environment_id = azurerm_container_app_environment.main.id
  revision_mode                = "Single"

  template {
    container {
      name   = "backend"
      image  = var.container_image
      cpu    = 0.25
      memory = "0.5Gi"

      env {
        name  = "DATABASE_URL"
        value = var.database_url
      }

      env {
        name        = "SECRET_KEY"
        secret_name = "secret-key"
      }

      env {
        name        = "OPENAI_API_KEY"
        secret_name = "openai-api-key"
      }
    }

    min_replicas = 0
    max_replicas = 3
  }

  ingress {
    external_enabled = true
    target_port      = 8000

    traffic_weight {
      percentage      = 100
      latest_revision = true
    }
  }

  secret {
    name  = "secret-key"
    value = var.secret_key
  }

  secret {
    name  = "openai-api-key"
    value = var.openai_api_key
  }

  tags = azurerm_resource_group.main.tags
}
