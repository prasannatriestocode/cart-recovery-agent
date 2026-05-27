CREATE TABLE IF NOT EXISTS merchants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  clerk_user_id STRING UNIQUE NOT NULL,
  email STRING NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS cart_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  merchant_id UUID NOT NULL REFERENCES merchants(id) ON DELETE CASCADE,
  session_data JSONB NOT NULL,
  abandoned_at TIMESTAMPTZ,
  recovered BOOL NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  INDEX (merchant_id, abandoned_at DESC)
);

CREATE TABLE IF NOT EXISTS diagnostics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  merchant_id UUID NOT NULL REFERENCES merchants(id) ON DELETE CASCADE,
  cart_sample JSONB NOT NULL,
  root_causes JSONB NOT NULL,
  drop_off_metrics JSONB NOT NULL,
  status STRING NOT NULL DEFAULT 'completed',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  INDEX (merchant_id, created_at DESC)
);

CREATE TABLE IF NOT EXISTS code_fixes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  diagnostic_id UUID NOT NULL REFERENCES diagnostics(id) ON DELETE CASCADE,
  fix_type STRING NOT NULL,
  component_name STRING NOT NULL,
  component_code STRING NOT NULL,
  test_code STRING NOT NULL,
  explanation STRING NOT NULL,
  deployment_notes STRING,
  status STRING NOT NULL DEFAULT 'generated',
  deployed BOOL NOT NULL DEFAULT false,
  deployed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  INDEX (diagnostic_id, created_at DESC)
);