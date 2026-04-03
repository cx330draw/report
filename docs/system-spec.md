# 系統規格草案（可實作版）

## 1) 角色與權限（RBAC）

### 員工
- 註冊/登入
- 檢視訂單公佈欄
- 承接可接單
- 上傳完工圖片
- 檢視個人薪資明細

### 管理員
- 新建/編輯訂單
- 指派或改派承接人員
- 設定訂單種類與價格
- 調整員工階級
- 審核完工圖片
- 檢視營業報表、薪資、打賞
- 檢視系統操作紀錄

## 2) 訂單流程狀態機

1. `OPEN`：新建可承接
2. `IN_PROGRESS`：員工承接後進行中
3. `PROOF_UPLOADED`：回傳指定圖片待審核
4. `APPROVED`：管理員審核通過
5. `REJECTED`：審核退回（需補件）

> 僅 `APPROVED` 狀態可計入「營業報表」與「員工薪資」。

## 3) 資料表建議

### users
- id (PK)
- account (unique)
- password_hash
- display_name
- role (`EMPLOYEE`/`ADMIN`)
- level_id (FK)
- is_active
- created_at

### employee_levels
- id (PK)
- name（如：新手、菁英、王牌）
- salary_ratio（例如 0.55 ~ 0.75）
- updated_at

### order_types
- id (PK)
- type_name
- base_price
- is_active

### orders
- id (PK)
- order_no (unique)
- server_name
- order_type_id (FK)
- boss_name
- amount
- note
- status
- assignee_user_id (FK, nullable)
- created_by (FK -> users)
- created_at
- updated_at

### order_proofs
- id (PK)
- order_id (FK)
- uploaded_by (FK -> users)
- image_url
- uploaded_at
- review_status (`PENDING`/`APPROVED`/`REJECTED`)
- reviewed_by (FK -> users, nullable)
- reviewed_at (nullable)
- review_comment (nullable)

### salary_ledgers
- id (PK)
- user_id (FK)
- order_id (FK)
- gross_amount
- ratio
- salary_amount
- tip_amount
- settled_date

### tips
- id (PK)
- order_id (FK)
- target_user_id (FK)
- amount
- created_by (FK -> users)
- created_at

### operation_logs
- id (PK)
- actor_user_id (FK)
- action_type
- target_type
- target_id
- before_json
- after_json
- created_at

## 4) API 建議（REST）

### Auth
- `POST /auth/register`
- `POST /auth/login`
- `POST /auth/refresh`

### 訂單與公佈欄
- `GET /orders?status=OPEN`
- `GET /orders/{id}`
- `POST /orders`（管理員）
- `PATCH /orders/{id}`（管理員）
- `POST /orders/{id}/take`（員工）
- `POST /orders/{id}/assign`（管理員）

### 完工圖片與審核
- `POST /orders/{id}/proofs`（員工上傳）
- `POST /orders/{id}/approve`（管理員審核通過）
- `POST /orders/{id}/reject`（管理員退回）

### 訂單種類/價格
- `GET /order-types`
- `POST /order-types`（管理員）
- `PATCH /order-types/{id}`（管理員）

### 員工階級
- `GET /employee-levels`
- `PATCH /users/{id}/level`（管理員）

### 報表與薪資
- `GET /reports/daily?date=YYYY-MM-DD`
- `GET /salaries/me`
- `GET /salaries?date=YYYY-MM-DD`（管理員）

### 打賞
- `POST /tips`
- `GET /tips?userId={id}`

### 操作紀錄
- `GET /operation-logs`（管理員）

## 5) 驗收重點

- 訂單公佈欄預覽僅顯示：伺服器、單種名稱
- 訂單詳情可顯示 5 欄：伺服器、單種名稱、老闆名稱、訂單金額、備註
- 未上傳完工圖不可審核
- 未審核通過不得計入營收與薪資
- 所有管理操作須留 `operation_logs`
