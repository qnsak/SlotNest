# ADR-0001：使用 booking_reference 作為對外公開識別碼（Public Identifier）

## 狀態
Accepted

## 背景（Context）
本專案為「Web MVP v1」預約系統（先不串接 LINE LIFF）。
v1 不做登入，因此需要一個方式讓使用者能：
- 查詢預約
- 取消預約

同時必須避免：
- 暴露資料庫主鍵造成可枚舉（enumeration）風險
- 將 v1 的臨時身份策略綁死，導致未來接 LIFF 時大量重構

## 決策（Decision）
在 Booking 資料模型中新增欄位 `booking_reference`，作為：
- 使用者查詢/取消預約的唯一憑證（public identifier）
- 對外 API 的路徑參數（/bookings/{booking_reference}）

同時保留內部主鍵 `id` 只用於資料庫關聯與內部維護，不對外公開。

## 為何不使用 customer_token
v1 若採 customer_token，需要：
- 使用者端保存 token（localStorage / cookie）
- API 需同時處理 token 綁定與查詢邏輯

在目前需求中，使用者的操作以「單筆預約」為中心，且不要求跨裝置登入或歷史管理；
因此以 booking_reference 作為單筆預約的公開識別碼更直接，降低前後端狀態管理成本，
並能更快驗證「預約流程與規則」是否合理。

## 為何不暴露主鍵（booking_id / id）
資料庫主鍵（特別是自增數字）容易被猜測與枚舉，會造成：
- 未授權查詢他人預約的風險
- 未授權取消他人預約的風險

即使主鍵使用 UUID，主鍵仍承擔「內部資料結構」的語義；
將其對外暴露會降低後續內部重構（例如更換主鍵策略、資料搬遷）時的彈性。

因此採取「內外分離」：
- `id`：internal primary key（不對外）
- `booking_reference`：public identifier（對外）

## 為何選用 booking_reference 命名
`booking_reference` 明確表達：
- 此欄位是對外提供的「查詢/引用碼」
- 與內部主鍵 `id` 的用途不同
避免 `booking_id` 在語義上同時代表內部主鍵與外部憑證而造成混淆。

## booking_reference 的生成要求
- 必須為高熵隨機字串（不可猜測）
- 必須具唯一性（DB unique constraint）
- 長度與字元集需適合放在 URL path

（具體格式與長度在實作時定義，例如 UUIDv4 或等效高熵字串）

## 後果（Consequences）
### 正面
- v1 不需登入仍可完成查詢與取消
- 避免暴露主鍵，提高安全邊界
- 未來接 LIFF 時可逐步替換身份策略，減少重構範圍

### 負面 / 限制
- 屬於「持有即擁有」模式：只要取得 booking_reference 就可操作該預約
- 若未來要強化安全性，需引入使用者身份（LINE userId）與權限驗證

## 未來接 LIFF 的替換策略（Migration Strategy）
當串接 LIFF 後：
1. 後端新增 user identity（例如 LINE userId）欄位到 Booking（如 `line_user_id`）
2. 建立規則：查詢/取消預約需同時滿足：
   - booking_reference 存在
   - booking 所屬 line_user_id 與當前登入者一致
3. 逐步調整前端：以 LIFF 身份為主，booking_reference 作為輔助（或僅保留查詢碼用途）
4. 最終可選擇：
   - 保留 booking_reference 作為客服查詢碼
   - 或降低其權限（例如只能查詢不可取消）
