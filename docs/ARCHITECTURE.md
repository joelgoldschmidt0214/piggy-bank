# アーキテクチャ設計

## システム全体像

```
┌──────────────────────────────────────────────────────────────────┐
│                          Client Layer                             │
│  ┌────────────────┐  ┌────────────────┐  ┌────────────────┐    │
│  │  Web Browser   │  │ Mobile Browser │  │  Future: App   │    │
│  │  (Next.js)     │  │  (Responsive)  │  │  (React Native)│    │
│  └────────────────┘  └────────────────┘  └────────────────┘    │
└──────────────────────────────────────────────────────────────────┘
                              │
                              │ HTTPS
                              ▼
┌──────────────────────────────────────────────────────────────────┐
│                       Application Layer                           │
│  ┌────────────────────────────────────────────────────────┐     │
│  │               Next.js Server (SSR/SSG)                 │     │
│  │  ┌──────────────┐  ┌──────────────┐  ┌─────────────┐ │     │
│  │  │Server Actions│  │ API Routes   │  │  Middleware │ │     │
│  │  └──────────────┘  └──────────────┘  └─────────────┘ │     │
│  │            BetterAuth (Session Management)             │     │
│  └────────────────────────────────────────────────────────┘     │
└──────────────────────────────────────────────────────────────────┘
                              │
                              │ REST API
                              ▼
┌──────────────────────────────────────────────────────────────────┐
│                         Backend Layer                             │
│  ┌────────────────────────────────────────────────────────┐     │
│  │                    FastAPI Application                 │     │
│  │  ┌──────────────┐  ┌──────────────┐  ┌─────────────┐ │     │
│  │  │   Routes     │  │   Services   │  │   Models    │ │     │
│  │  │   (API v1)   │  │  (Business)  │  │(SQLAlchemy) │ │     │
│  │  └──────────────┘  └──────────────┘  └─────────────┘ │     │
│  │         │                  │                  │         │     │
│  │         └──────────────────┴──────────────────┘         │     │
│  │                           │                              │     │
│  │  ┌────────────────────────▼────────────────────────┐   │     │
│  │  │         Dependency Injection (FastAPI)          │   │     │
│  │  └─────────────────────────────────────────────────┘   │     │
│  └────────────────────────────────────────────────────────┘     │
└──────────────────────────────────────────────────────────────────┘
                              │
                    ┌─────────┴─────────┐
                    │                   │
                    ▼                   ▼
       ┌───────────────────┐  ┌──────────────────┐
       │    PostgreSQL     │  │   OpenAI API     │
       │   (Supabase)      │  │  (gpt-4o-mini)   │
       │  Row Level Sec.   │  │                  │
       └───────────────────┘  └──────────────────┘
```

## レイヤー別責務

### 1. Frontend (Next.js)

#### App Router 構造

```
app/
├── (auth)/              # 認証関連ルートグループ
│   ├── login/
│   └── callback/
├── (dashboard)/         # メインアプリルートグループ
│   ├── layout.tsx       # 共通レイアウト
│   ├── page.tsx         # ダッシュボード
│   └── transactions/    # 取引管理
├── api/                 # API Routes (必要時のみ)
├── layout.tsx           # ルートレイアウト
└── page.tsx             # ランディングページ
```

#### 状態管理戦略

- **Server State**: React Server Components + Server Actions
- **Client State**: React hooks (useState, useReducer)
- **Form State**: React Hook Form + Zod validation
- **Cache**: Next.js built-in cache (fetch + revalidate)

### 2. Backend (FastAPI)

#### ディレクトリ構造

```
app/
├── api/
│   └── v1/              # API v1 endpoints
│       ├── transactions.py
│       ├── users.py
│       └── analysis.py
├── core/                # Core utilities
│   ├── config.py        # Settings
│   ├── database.py      # DB session
│   └── security.py      # Auth utilities
├── models/              # SQLAlchemy models
│   ├── user.py
│   └── transaction.py
├── schemas/             # Pydantic schemas
│   ├── user.py
│   └── transaction.py
├── services/            # Business logic
│   ├── ai_advisor.py
│   └── analytics.py
└── main.py              # FastAPI app
```

#### 依存性注入フロー

```python
# エンドポイント
@router.post("/transactions/")
async def create_transaction(
    transaction: TransactionCreate,           # Request body
    current_user: dict = Depends(get_current_user),  # DI: Auth
    db: AsyncSession = Depends(get_db),       # DI: DB session
):
    # Business logic
    pass
```

### 3. Database (PostgreSQL + Supabase)

#### ER図

```
┌─────────────────┐
│     Users       │
├─────────────────┤
│ id (PK)         │
│ auth_id (UQ)    │
│ email (UQ)      │
│ name            │
│ avatar_url      │
│ created_at      │
│ updated_at      │
└─────────────────┘
         │
         │ 1
         │
         │ N
         ▼
┌─────────────────┐
│  Transactions   │
├─────────────────┤
│ id (PK)         │
│ user_id (FK)    │
│ item_name       │
│ amount          │
│ category        │
│ note            │
│ created_at      │
│ updated_at      │
└─────────────────┘
```

#### インデックス戦略

```sql
-- Performance optimization
CREATE INDEX idx_transactions_user_id ON transactions(user_id);
CREATE INDEX idx_transactions_created_at ON transactions(created_at DESC);
CREATE INDEX idx_transactions_category ON transactions(category);
CREATE INDEX idx_users_auth_id ON users(auth_id);
```

## データフロー

### 1. 認証フロー

```
1. User clicks "Login with Google"
   └─> Frontend: Redirect to Google OAuth

2. Google authenticates user
   └─> Callback URL: /api/auth/callback/google

3. BetterAuth processes callback
   ├─> Create/Update user in DB
   └─> Set HttpOnly cookie (session token)

4. Frontend: Redirect to /dashboard
   └─> Server Components fetch user data

5. API requests include session cookie
   └─> Backend validates JWT token
       └─> Returns user_id in dependency injection
```

### 2. 取引作成フロー

```
1. User fills form (item_name, amount, category)
   └─> Frontend: React Hook Form validation (Zod)

2. Form submit → Server Action
   └─> POST /api/v1/transactions/

3. Backend: FastAPI endpoint
   ├─> Validate request (Pydantic schema)
   ├─> Check authentication (Depends(get_current_user))
   ├─> Create transaction (SQLAlchemy)
   └─> Return response (TransactionResponse schema)

4. Frontend: Revalidate cache
   └─> Update UI (Optimistic Update)
```

### 3. AI分析フロー

```
1. User clicks "分析する"
   └─> GET /api/v1/analysis/

2. Backend: ai_advisor.py service
   ├─> Query transactions (SQLAlchemy)
   │   └─> Aggregate by category, month
   │
   ├─> Build AI prompt
   │   └─> Include: total, categories, trends
   │
   ├─> Call OpenAI API
   │   └─> Model: gpt-4o-mini
   │   └─> Response: JSON (structured output)
   │
   └─> Return advice + data

3. Frontend: Display results
   ├─> Status badge (safe/warning/danger)
   ├─> Message card
   ├─> Action items list
   └─> Charts (Recharts)
```

## セキュリティアーキテクチャ

### 1. 認証・認可

```
┌─────────────────────────────────────────────────────┐
│               Authentication Flow                    │
├─────────────────────────────────────────────────────┤
│                                                      │
│  1. Google OAuth 2.0                                │
│     └─> BetterAuth handles flow                    │
│                                                      │
│  2. Session Token (JWT)                             │
│     ├─> Stored in HttpOnly Cookie                  │
│     ├─> Secure flag (HTTPS only)                   │
│     ├─> SameSite=Lax (CSRF protection)             │
│     └─> 7 days expiration                          │
│                                                      │
│  3. Backend Verification                            │
│     ├─> Extract token from Cookie                  │
│     ├─> Verify JWT signature (SECRET_KEY)          │
│     ├─> Check expiration                           │
│     └─> Return user_id                             │
│                                                      │
└─────────────────────────────────────────────────────┘
```

### 2. Row Level Security (RLS)

```sql
-- Users can only access their own data
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users view own transactions" ON transactions
  FOR SELECT USING (
    user_id IN (
      SELECT id FROM users
      WHERE auth_id = current_setting('app.user_id')::text
    )
  );
```

## セキュリティスキャン戦略

### Trivy による包括的セキュリティスキャン

プロジェクトルートの `trivy.yaml` 設定により、以下のスキャンを実施：

#### スキャン対象

1. **脆弱性 (Vulnerability)**: 依存パッケージの既知の脆弱性
2. **設定ミス (Config)**: Dockerfile, Kubernetes YAML, Terraform 等の不適切な設定
3. **シークレット (Secret)**: ハードコードされたAPIキー、パスワード等の検出

#### ローカル実行方法

```bash
# 全スキャン実行（trivy.yaml の設定を使用）
just security-scan

# または直接Trivyコマンド実行
trivy fs .
```

#### CI/CD自動実行

`.github/workflows/security.yml` で以下のタイミングで自動実行：

- **プルリクエスト作成時**
- **main ブランチへのプッシュ時**
- **スケジュール実行** (毎日午前0時 UTC)

#### スキャン結果の確認

```bash
# GitHub Actions の Security タブで確認
# または GitHub Advanced Security が有効な場合、Code scanning alerts に表示
```

#### 除外設定（trivy.yaml）

```yaml
# 既知の誤検知や対応不要な項目を除外
vulnerability:
  ignore:
    - CVE-2024-XXXXX  # 理由: 影響範囲外のため
```

詳細は [trivy.yaml](../trivy.yaml) を参照。

---

## スケーリング戦略

### 水平スケーリング

```
┌──────────────────────────────────────────────┐
│         Load Balancer (Azure Front Door)      │
└──────────────────────────────────────────────┘
                    │
        ┌───────────┼───────────┐
        │           │           │
        ▼           ▼           ▼
   ┌────────┐  ┌────────┐  ┌────────┐
   │Backend │  │Backend │  │Backend │
   │ Pod 1  │  │ Pod 2  │  │ Pod 3  │
   └────────┘  └────────┘  └────────┘
        │           │           │
        └───────────┼───────────┘
                    ▼
          ┌─────────────────┐
          │  PostgreSQL     │
          │  (Read Replica) │
          └─────────────────┘
```

### キャッシュ戦略

- **Frontend**: Next.js ISR (Incremental Static Regeneration)
- **Backend**: Redis (TODO: 将来実装)
- **Database**: Query result cache (PostgreSQL)

## モニタリング・ロギング

### ログレベル

- **ERROR**: エラー発生時（通知必要）
- **WARN**: 警告（監視必要）
- **INFO**: 重要イベント（認証、トランザクション等）
- **DEBUG**: 開発時デバッグ情報

### メトリクス

- **API Response Time**: p50, p95, p99
- **Error Rate**: 4xx, 5xx
- **Database Connection Pool**: active, idle
- **OpenAI API**: latency, token usage

---

**最終更新**: 2026年1月28日
