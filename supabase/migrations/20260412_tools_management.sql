-- ============================================================
-- Tools Management System — Schema Updates
-- Run in Supabase SQL Editor
-- ============================================================

-- Add validation columns
ALTER TABLE tools 
ADD COLUMN IF NOT EXISTS validation_status varchar(32) DEFAULT 'unknown',
ADD COLUMN IF NOT EXISTS last_validated_at timestamptz,
ADD COLUMN IF NOT EXISTS validation_message text;

-- Add affiliate tracking columns
ALTER TABLE tools
ADD COLUMN IF NOT EXISTS affiliate_status varchar(32) DEFAULT 'none',
ADD COLUMN IF NOT EXISTS affiliate_network varchar(64),
ADD COLUMN IF NOT EXISTS commission_rate varchar(128),
ADD COLUMN IF NOT EXISTS commission_type varchar(32);

-- Add discovery tracking columns
ALTER TABLE tools
ADD COLUMN IF NOT EXISTS product_hunt_id varchar(64),
ADD COLUMN IF NOT EXISTS discovery_source varchar(32) DEFAULT 'manual';

-- Create indexes for filtering
CREATE INDEX IF NOT EXISTS tools_validation_status_idx ON tools(validation_status);
CREATE INDEX IF NOT EXISTS tools_affiliate_status_idx ON tools(affiliate_status);
CREATE INDEX IF NOT EXISTS tools_discovery_source_idx ON tools(discovery_source);
CREATE INDEX IF NOT EXISTS tools_product_hunt_id_idx ON tools(product_hunt_id);

-- Add comments for documentation
COMMENT ON COLUMN tools.validation_status IS 'URL health: valid, broken, redirected, unknown';
COMMENT ON COLUMN tools.last_validated_at IS 'Last time URL was checked';
COMMENT ON COLUMN tools.validation_message IS 'Error details if broken/redirected';
COMMENT ON COLUMN tools.affiliate_status IS 'Affiliate program: none, pending, approved, rejected';
COMMENT ON COLUMN tools.affiliate_network IS 'Network name: Impact, PartnerStack, ShareASale, CJ, Direct, Amazon';
COMMENT ON COLUMN tools.commission_rate IS 'Commission details: 30% recurring, Up to $200/sale, etc.';
COMMENT ON COLUMN tools.commission_type IS 'Payment type: one-time, recurring, per-signup';
COMMENT ON COLUMN tools.product_hunt_id IS 'Product Hunt slug for deduplication';
COMMENT ON COLUMN tools.discovery_source IS 'How tool was added: manual, product_hunt, import';
