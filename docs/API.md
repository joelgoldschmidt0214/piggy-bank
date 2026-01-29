# API 仕様書

**Base URL**: `http://localhost:8000` (開発環境)
**API Version**: v1
**Authentication**: Bearer Token (JWT)

---

## 📌 目次

- [認証](#認証)
- [ユーザー](#ユーザー)
- [取引](#取引)
- [AI分析](#ai分析)
- [エラーレスポンス](#エラーレスポンス)

---

## 認証

### Authentication Flow

1. Frontend が Google OAuth にリダイレクト
2. ユーザーがGoogleで認証
3. Callback URL で BetterAuth がセッション作成
4. HttpOnly Cookie にセッショントークン保存
5. 以降のAPIリクエストでCookieを自動送信

### Headers

すべての認証が必要なエンドポイントには以下のヘッダーが必要：

```
Authorization: Bearer <jwt_token>
```

---

## ユーザー

### GET /api/v1/users/me

現在のログインユーザー情報を取得。

#### Request

```http
GET /api/v1/users/me HTTP/1.1
Host: localhost:8000
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

#### Response (200 OK)

```json
{
  "id": 1,
  "auth_id": "google_oauth2_123456789",
  "email": "user@example.com",
  "name": "山田太郎",
  "avatar_url": "https://example.com/avatar.jpg",
  "created_at": "2026-01-01T00:00:00Z",
  "updated_at": "2026-01-28T12:00:00Z"
}
```

---

## 取引

### POST /api/v1/transactions/

新規取引を作成。

#### Request

```http
POST /api/v1/transactions/ HTTP/1.1
Host: localhost:8000
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
Content-Type: application/json

{
  "item_name": "スターバックス コーヒー",
  "amount": 520,
  "category": "食費",
  "note": "モーニングコーヒー"
}
```

#### Request Body Schema

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| item_name | string | ✅ | アイテム名（1-255文字） |
| amount | integer | ✅ | 金額（正の整数、円） |
| category | string | ❌ | カテゴリ（最大100文字） |
| note | string | ❌ | メモ（最大500文字） |

#### Response (201 Created)

```json
{
  "id": 42,
  "user_id": 1,
  "item_name": "スターバックス コーヒー",
  "amount": 520,
  "category": "食費",
  "note": "モーニングコーヒー",
  "created_at": "2026-01-28T09:30:00Z",
  "updated_at": "2026-01-28T09:30:00Z"
}
```

---

### GET /api/v1/transactions/

取引一覧を取得（ページネーション対応）。

#### Request

```http
GET /api/v1/transactions/?skip=0&limit=20 HTTP/1.1
Host: localhost:8000
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

#### Query Parameters

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| skip | integer | 0 | スキップする件数 |
| limit | integer | 100 | 取得する件数（最大100） |

#### Response (200 OK)

```json
[
  {
    "id": 42,
    "user_id": 1,
    "item_name": "スターバックス コーヒー",
    "amount": 520,
    "category": "食費",
    "note": "モーニングコーヒー",
    "created_at": "2026-01-28T09:30:00Z",
    "updated_at": "2026-01-28T09:30:00Z"
  },
  {
    "id": 41,
    "user_id": 1,
    "item_name": "電車代",
    "amount": 220,
    "category": "交通費",
    "note": null,
    "created_at": "2026-01-27T18:00:00Z",
    "updated_at": "2026-01-27T18:00:00Z"
  }
]
```

---

### GET /api/v1/transactions/{transaction_id}

特定の取引詳細を取得。

#### Request

```http
GET /api/v1/transactions/42 HTTP/1.1
Host: localhost:8000
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

#### Response (200 OK)

```json
{
  "id": 42,
  "user_id": 1,
  "item_name": "スターバックス コーヒー",
  "amount": 520,
  "category": "食費",
  "note": "モーニングコーヒー",
  "created_at": "2026-01-28T09:30:00Z",
  "updated_at": "2026-01-28T09:30:00Z"
}
```

#### Response (404 Not Found)

```json
{
  "detail": "Transaction not found"
}
```

---

### PUT /api/v1/transactions/{transaction_id}

取引を更新。

#### Request

```http
PUT /api/v1/transactions/42 HTTP/1.1
Host: localhost:8000
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
Content-Type: application/json

{
  "amount": 550,
  "note": "モーニングコーヒー + クッキー"
}
```

#### Request Body Schema

すべてのフィールドはオプション（更新したいフィールドのみ送信）。

| Field | Type | Description |
|-------|------|-------------|
| item_name | string | アイテム名（1-255文字） |
| amount | integer | 金額（正の整数） |
| category | string | カテゴリ（最大100文字） |
| note | string | メモ（最大500文字） |

#### Response (200 OK)

```json
{
  "id": 42,
  "user_id": 1,
  "item_name": "スターバックス コーヒー",
  "amount": 550,
  "category": "食費",
  "note": "モーニングコーヒー + クッキー",
  "created_at": "2026-01-28T09:30:00Z",
  "updated_at": "2026-01-28T10:15:00Z"
}
```

---

### DELETE /api/v1/transactions/{transaction_id}

取引を削除。

#### Request

```http
DELETE /api/v1/transactions/42 HTTP/1.1
Host: localhost:8000
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

#### Response (204 No Content)

レスポンスボディなし。

#### Response (404 Not Found)

```json
{
  "detail": "Transaction not found"
}
```

---

## AI分析

### GET /api/v1/analysis/

ユーザーの取引データをAI分析してアドバイスを取得。

#### Request

```http
GET /api/v1/analysis/ HTTP/1.1
Host: localhost:8000
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

#### Response (200 OK)

```json
{
  "total_amount": 125000,
  "transaction_count": 47,
  "top_categories": [
    {
      "category": "食費",
      "amount": 45000
    },
    {
      "category": "交通費",
      "amount": 25000
    },
    {
      "category": "娯楽",
      "amount": 20000
    }
  ],
  "ai_advice": {
    "status": "warning",
    "message": "今月の支出は予算をやや超えています",
    "advice": "食費が全体の36%を占めています。外食を週1回減らすことで月5,000円の節約が可能です。",
    "action_items": [
      "週末の外食を月2回に減らす",
      "コンビニでの買い物を控える",
      "食費の予算を月4万円に設定"
    ]
  }
}
```

#### Response Fields

| Field | Type | Description |
|-------|------|-------------|
| total_amount | integer | 今月の支出総額（円） |
| transaction_count | integer | 取引回数 |
| top_categories | array | TOP5カテゴリ別集計 |
| ai_advice | object | AI分析結果 |
| ai_advice.status | string | ステータス（safe/warning/danger） |
| ai_advice.message | string | 励ましの言葉 |
| ai_advice.advice | string | 具体的なアドバイス |
| ai_advice.action_items | array | 推奨アクション |

---

## エラーレスポンス

### 一般的なエラーフォーマット

```json
{
  "detail": "エラーメッセージ"
}
```

### HTTPステータスコード

| Code | Description |
|------|-------------|
| 200 | 成功 |
| 201 | 作成成功 |
| 204 | 成功（レスポンスボディなし） |
| 400 | リクエストエラー（バリデーション失敗） |
| 401 | 認証エラー（トークン無効/期限切れ） |
| 403 | 権限エラー |
| 404 | リソースが見つからない |
| 422 | バリデーションエラー（詳細情報付き） |
| 500 | サーバーエラー |

### バリデーションエラー例 (422)

```json
{
  "detail": [
    {
      "loc": ["body", "amount"],
      "msg": "ensure this value is greater than 0",
      "type": "value_error.number.not_gt"
    }
  ]
}
```

---

## レート制限

現在、レート制限は実装されていません（TODO）。

将来的な実装予定：

- **認証済みユーザー**: 1,000 requests/hour
- **AI分析**: 10 requests/hour

---

## WebSocket (TODO)

リアルタイム通知機能は今後実装予定。

```
ws://localhost:8000/ws/notifications
```

---

## API Playground

インタラクティブなAPI仕様は以下で確認可能：

- **Swagger UI**: <http://localhost:8000/docs>
- **ReDoc**: <http://localhost:8000/redoc>

---

**最終更新**: 2026年1月28日
