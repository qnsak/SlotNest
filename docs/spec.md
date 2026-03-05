# 預約系統規格（Web MVP v1）

## 1) 目標
建立一個可用的「個人預約系統」（先不串接 LINE LIFF）：
- 管理者可設定未來三個月內的可預約時間區間
- 使用者可在可預約時間區間內建立預約
- 使用者可用「booking_reference」查詢與取消預約
- v1 不包含通知（LINE/Email/SMS）

## 2) 角色與存取（v1）
### 使用者（User）
- 不做登入
- 建立預約成功後取得 `booking_reference`
- 後續查詢/取消以 `booking_reference` 作為唯一憑證（持有即擁有模型）

### 管理者（Admin）
- 後台管理 API 需有最小保護（v1 建議 Basic Auth）
- 可建立/刪除可預約時間區間
- 可檢視預約列表
- 可取消預約（用於釋放時間區間）

## 3) 功能範圍（MVP 必做）
### 3.1 管理者後台
1. 建立可預約時間區間（Availability Interval）
   - 管理者可選日期並設定時間區間（start_time/end_time）
   - 僅允許設定：從「現在」起往後三個月內的日期
   - 同一日期的時間區間不可重疊
2. 刪除可預約時間區間
   - 若該區間內存在任何 ACTIVE 預約：禁止刪除（必須先取消預約）
3. 檢視預約
   - 依日期/時間區間查詢預約清單（最小可用即可）
4. 取消預約
   - 管理者可取消某筆預約（使該時間區間可被刪除或重新預約）

### 3.2 使用者端（Web）
1. 檢視可預約時間區間（未來三個月）
2. 建立預約（成功回傳 booking_reference）
3. 使用 booking_reference 查詢預約
4. 使用 booking_reference 取消預約

## 4) 不在範圍（v1 不做）
- 通知（LINE/Email/SMS）
- 金流
- 完整登入/權限系統
- 多管理者、多資源（多服務人員）排班
- 複雜審計與操作紀錄（audit log）

## 5) 核心資料模型（概念）
### AvailabilityInterval（可預約時間區間）
- id（internal primary key）
- date（YYYY-MM-DD）
- start_time（HH:MM）
- end_time（HH:MM）
- created_at

### Booking（預約）
- id（internal primary key）
- booking_reference（公開查詢碼，高熵隨機，不可猜測，具唯一性）
- interval_id（FK）
- status（ACTIVE / CANCELED）
- created_at
- canceled_at（可選）

> 命名原則：
> - `id`：內部主鍵
> - `booking_reference`：對外查詢/取消用的公開識別碼（public identifier）

## 6) 核心規則（硬規則）
### 6.1 三個月限制
- 管理者只能建立「現在起往後三個月」內的時間區間
- 使用者只能看到/預約這個範圍內的時間區間

### 6.2 時間區間不可重疊（同一日期）
- 同一天所有區間不可重疊：
  - [start1, end1) 與 [start2, end2) 不可有交集
- 必須滿足 start_time < end_time

### 6.3 有預約不可刪除時間區間
- 若 interval 內存在任何 ACTIVE booking：
  - 管理者刪除 interval 必須失敗
  - 必須先取消 booking 才能刪除 interval

### 6.4 建立預約的有效性
- 使用者建立預約必須指定 interval_id
- interval 必須存在且位於允許的日期範圍內

### 6.5 v1 容量策略（需明確）
- v1 採用：**每個 interval 只能有 1 筆 ACTIVE booking**
  - 若該 interval 已存在 ACTIVE booking，建立預約必須失敗（避免超賣）

## 7) API（最小集合）
### 系統
- GET /healthz

### Admin（需 Basic Auth）
- POST   /admin/intervals
- GET    /admin/intervals?from=YYYY-MM-DD&to=YYYY-MM-DD
- DELETE /admin/intervals/{interval_id}
- GET    /admin/bookings?date=YYYY-MM-DD
- POST   /admin/bookings/{booking_reference}/cancel

### User
- GET  /intervals?from=YYYY-MM-DD&to=YYYY-MM-DD
- POST /bookings
- GET  /bookings/{booking_reference}
- POST /bookings/{booking_reference}/cancel

## 8) 錯誤格式（統一）
回應內容建議包含：
- code（string）
- message（string）
- details（object，可選）

建議錯誤碼（最小集合）：
- OUT_OF_RANGE（三個月範圍限制）
- INTERVAL_OVERLAP（區間重疊）
- INTERVAL_HAS_BOOKINGS（有 ACTIVE booking 不可刪 interval）
- INTERVAL_NOT_FOUND
- BOOKING_NOT_FOUND
- BOOKING_ALREADY_CANCELED
- INTERVAL_ALREADY_BOOKED（同 interval 已有 ACTIVE booking）
- UNAUTHORIZED（admin）

## 9) 驗收準則（Acceptance Criteria）
### AC-01 三個月限制
- 當管理者建立超出三個月範圍的 interval，必須失敗（OUT_OF_RANGE）

### AC-02 不可重疊
- 同一日期已有 [10:00, 12:00)，建立 [11:00, 13:00) 必須失敗（INTERVAL_OVERLAP）

### AC-03 有預約不可刪 interval
- interval 內存在 ACTIVE booking，刪除 interval 必須失敗（INTERVAL_HAS_BOOKINGS）

### AC-04 booking_reference 查詢與取消
- 以 booking_reference 可查到該筆 booking
- 以 booking_reference 可取消該筆 booking（重複取消需可預期的錯誤：BOOKING_ALREADY_CANCELED）

### AC-05 每 interval 只允許 1 筆 ACTIVE booking
- 對同一 interval 建立兩次 booking：
  - 第一次成功
  - 第二次必須失敗（INTERVAL_ALREADY_BOOKED）

## 10) 工程驗收（CI）
- `make ci` 必須通過：
  - 後端：lint + test
  - 前端：lint + build
- 關鍵規則必須有自動化測試覆蓋（至少涵蓋 AC-01 ~ AC-05）
