-- Additive migration for the existing PhoneZone database.
-- Review and back up the deployment database before applying; test on a copy first.
BEGIN;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS shipping_fee bigint DEFAULT 0;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS rewards_credited boolean DEFAULT true;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS used_coupon_id bigint;
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'orders_used_coupon_fk') THEN
        ALTER TABLE orders ADD CONSTRAINT orders_used_coupon_fk
            FOREIGN KEY (used_coupon_id) REFERENCES user_coupons(id);
    END IF;
END $$;
COMMIT;
