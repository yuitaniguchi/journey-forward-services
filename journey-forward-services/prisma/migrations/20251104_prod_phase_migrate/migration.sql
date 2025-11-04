-- -------------- TRANSACTION 開始 --------------
BEGIN;

-- 0) enum を安全に（既存ならスキップ）
DO $$ BEGIN
  CREATE TYPE "ServiceType" AS ENUM ('PICKUP','PICKUP_DELIVERY');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE "RequestStatus" AS ENUM ('RECEIVED','QUOTED','CONFIRMED','INVOICED','PAID','CANCELLED');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;


-- 1) 新テーブル作成（存在しなければ）。まず parent 側（customer）
CREATE TABLE IF NOT EXISTS customer (
  customer_id  TEXT PRIMARY KEY,
  name         TEXT NOT NULL,
  email        TEXT NOT NULL UNIQUE,
  phone        TEXT,
  created_at   TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at   TIMESTAMP(3) NOT NULL
);

-- 1-2) child 側（request/item 他）。FK は後から貼ってもOKだが、
--      今回は customer を先にコピーしてから FK 付きで作っても良い。

CREATE TABLE IF NOT EXISTS request (
  request_id      TEXT PRIMARY KEY,
  customer_id     TEXT NOT NULL,
  service_type    "ServiceType" NOT NULL,
  pickup_address  TEXT NOT NULL,
  delivery_address TEXT NOT NULL,
  preferred_datetime TIMESTAMP(3) NOT NULL,
  status          "RequestStatus" NOT NULL DEFAULT 'RECEIVED',
  request_initiated_at TIMESTAMP(3),
  free_cancellation_valid_until TIMESTAMP(3),
  final_amount    DECIMAL(10,2),
  created_at      TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at      TIMESTAMP(3) NOT NULL
);

CREATE TABLE IF NOT EXISTS item (
  item_id     TEXT PRIMARY KEY,
  request_id  TEXT NOT NULL,
  name        TEXT NOT NULL,
  description TEXT,
  size        TEXT NOT NULL,
  quantity    INTEGER NOT NULL,
  photo_url   TEXT,
  created_at  TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at  TIMESTAMP(3) NOT NULL
);

-- 新規エンティティ（旧DBに無かったはず）：空で作成
CREATE TABLE IF NOT EXISTS quotation (
  quotation_id        TEXT PRIMARY KEY,
  request_id          TEXT NOT NULL,
  estimated_price     DECIMAL(10,2) NOT NULL,
  unique_booking_link TEXT NOT NULL,
  email_sent_at       TIMESTAMP(3),
  created_at          TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at          TIMESTAMP(3) NOT NULL
);

CREATE TABLE IF NOT EXISTS payment (
  payment_id              TEXT PRIMARY KEY,
  request_id              TEXT NOT NULL,
  amount                  DECIMAL(10,2) NOT NULL,
  currency                TEXT NOT NULL DEFAULT 'JPY',
  status                  TEXT NOT NULL,
  stripe_payment_intent_id TEXT,
  payment_method          TEXT NOT NULL,
  created_at              TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at              TIMESTAMP(3) NOT NULL
);

CREATE TABLE IF NOT EXISTS admin (
  admin_id     TEXT PRIMARY KEY,
  username     TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  email        TEXT NOT NULL UNIQUE,
  created_at   TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at   TIMESTAMP(3) NOT NULL
);

CREATE TABLE IF NOT EXISTS notification (
  notification_id TEXT PRIMARY KEY,
  request_id      TEXT,
  type            TEXT NOT NULL,
  recipient_type  TEXT NOT NULL,
  sent_at         TIMESTAMP(3),
  status          TEXT NOT NULL
);

-- 2) 旧 → 新 データコピー（存在時のみ）
--    2-1) Customer
INSERT INTO customer (customer_id, name, email, phone, created_at, updated_at)
SELECT "id", name, email, phone, "createdAt", "updatedAt"
FROM "public"."Customer"
ON CONFLICT (customer_id) DO NOTHING;

--    2-2) Request
--    - preferred_datetime は旧 preferredDate をそのまま（必要なら preferredTime を合成）
--    - serviceType/status は enum キャスト（要：値一致）
--    - final_amount は丸めて numeric に
INSERT INTO request (
  request_id, customer_id, service_type, pickup_address, delivery_address,
  preferred_datetime, status, request_initiated_at, free_cancellation_valid_until,
  final_amount, created_at, updated_at
)
SELECT
  r."id"                                  AS request_id,
  r."customerId"                           AS customer_id,
  r."serviceType"::"ServiceType"           AS service_type,
  r."address"                              AS pickup_address,      -- 暫定：旧addressを両方へ
  r."address"                              AS delivery_address,    -- ※将来分離するならここでNULLにしてもOK
  r."preferredDate"                        AS preferred_datetime,  -- 必要なら preferredTime を合成（下に例）
  r."status"::"RequestStatus"              AS status,
  r."createdAt"                            AS request_initiated_at,
  NULL                                     AS free_cancellation_valid_until,
  CASE WHEN r."finalAmount" IS NULL THEN NULL ELSE ROUND((r."finalAmount")::numeric, 2) END AS final_amount,
  r."createdAt"                            AS created_at,
  r."updatedAt"                            AS updated_at
FROM "public"."Request" r
ON CONFLICT (request_id) DO NOTHING;

-- もし preferredTime (例: '14:30') を合成したい場合は、上の SELECT の
-- preferred_datetime を次の式に差し替え（失敗時は fallback で preferredDate）:
-- COALESCE(
--   (date_trunc('day', r."preferredDate")
--    + make_interval(
--        hours := NULLIF(split_part(r."preferredTime", ':', 1), '')::int,
--        minutes := NULLIF(split_part(r."preferredTime", ':', 2), '')::int
--      )),
--   r."preferredDate"
-- )

--    2-3) Item
--    - quantity は旧スキーマに無いので 1 で補完
--    - photo_url は旧 imageUrl をマップ
INSERT INTO item (
  item_id, request_id, name, description, size, quantity, photo_url, created_at, updated_at
)
SELECT
  i."id"          AS item_id,
  i."requestId"   AS request_id,
  i.name          AS name,
  NULL            AS description,
  i.size          AS size,
  1               AS quantity,
  i."imageUrl"    AS photo_url,
  i."createdAt"   AS created_at,
  i."updatedAt"   AS updated_at
FROM "public"."Item" i
ON CONFLICT (item_id) DO NOTHING;

-- 3) 索引の作成（存在チェック）
DO $$ BEGIN
  CREATE UNIQUE INDEX customer_email_key ON customer(email);
EXCEPTION WHEN duplicate_table THEN NULL; END $$;

DO $$ BEGIN
  CREATE INDEX request_status_idx ON request(status);
EXCEPTION WHEN duplicate_table THEN NULL; END $$;

DO $$ BEGIN
  CREATE INDEX request_customer_id_preferred_datetime_idx ON request(customer_id, preferred_datetime);
EXCEPTION WHEN duplicate_table THEN NULL; END $$;

DO $$ BEGIN
  CREATE INDEX item_request_id_idx ON item(request_id);
EXCEPTION WHEN duplicate_table THEN NULL; END $$;

DO $$ BEGIN
  CREATE INDEX quotation_request_id_idx ON quotation(request_id);
EXCEPTION WHEN duplicate_table THEN NULL; END $$;

DO $$ BEGIN
  CREATE INDEX payment_request_id_status_idx ON payment(request_id, status);
EXCEPTION WHEN duplicate_table THEN NULL; END $$;

DO $$ BEGIN
  CREATE INDEX notification_request_id_idx ON notification(request_id);
EXCEPTION WHEN duplicate_table THEN NULL; END $$;

-- 4) 外部キー（customer→request→item/quotation/payment/notification の順で整合）
-- 既に作成済みでも重複を避けるため、動的チェック
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE constraint_name='request_customer_id_fkey' AND table_name='request'
  ) THEN
    ALTER TABLE request
      ADD CONSTRAINT request_customer_id_fkey
      FOREIGN KEY (customer_id) REFERENCES customer(customer_id)
      ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;
END$$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE constraint_name='item_request_id_fkey' AND table_name='item'
  ) THEN
    ALTER TABLE item
      ADD CONSTRAINT item_request_id_fkey
      FOREIGN KEY (request_id) REFERENCES request(request_id)
      ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;
END$$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE constraint_name='quotation_request_id_fkey' AND table_name='quotation'
  ) THEN
    ALTER TABLE quotation
      ADD CONSTRAINT quotation_request_id_fkey
      FOREIGN KEY (request_id) REFERENCES request(request_id)
      ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;
END$$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE constraint_name='payment_request_id_fkey' AND table_name='payment'
  ) THEN
    ALTER TABLE payment
      ADD CONSTRAINT payment_request_id_fkey
      FOREIGN KEY (request_id) REFERENCES request(request_id)
      ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;
END$$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE constraint_name='notification_request_id_fkey' AND table_name='notification'
  ) THEN
    ALTER TABLE notification
      ADD CONSTRAINT notification_request_id_fkey
      FOREIGN KEY (request_id) REFERENCES request(request_id)
      ON DELETE SET NULL ON UPDATE CASCADE;
  END IF;
END$$;

-- -------------- TRANSACTION 終了 --------------
COMMIT;
