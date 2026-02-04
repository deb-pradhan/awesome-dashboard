-- CryptoLens Database Schema
-- PostgreSQL schema for historical market data and AI insights

-- Market snapshots for historical tracking
CREATE TABLE IF NOT EXISTS market_snapshots (
  id SERIAL PRIMARY KEY,
  timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  btc_price DECIMAL(12,2) NOT NULL,
  buy_sell_ratio DECIMAL(6,4),
  sentiment VARCHAR(20),
  top_upside_target VARCHAR(50),
  top_upside_probability DECIMAL(5,2),
  top_downside_target VARCHAR(50),
  top_downside_probability DECIMAL(5,2),
  total_volume BIGINT,
  total_markets INTEGER,
  raw_data JSONB
);

-- AI insights history
CREATE TABLE IF NOT EXISTS ai_insights (
  id SERIAL PRIMARY KEY,
  timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  trigger_type VARCHAR(50),
  trigger_previous DECIMAL(12,4),
  trigger_current DECIMAL(12,4),
  trigger_percent_change DECIMAL(8,4),
  key_observations TEXT[],
  sentiment VARCHAR(20),
  rationale TEXT,
  recommendation TEXT,
  suggested_strategies TEXT[],
  corporate_risk_level VARCHAR(20),
  government_risk_level VARCHAR(20),
  confidence DECIMAL(3,2)
);

-- Price history for charts
CREATE TABLE IF NOT EXISTS price_history (
  id SERIAL PRIMARY KEY,
  timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  btc_price DECIMAL(12,2) NOT NULL,
  source VARCHAR(50) DEFAULT 'coincap'
);

-- Indexes for efficient queries
CREATE INDEX IF NOT EXISTS idx_snapshots_timestamp ON market_snapshots(timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_insights_timestamp ON ai_insights(timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_price_history_timestamp ON price_history(timestamp DESC);

-- Views for common queries
CREATE OR REPLACE VIEW recent_snapshots AS
SELECT * FROM market_snapshots
ORDER BY timestamp DESC
LIMIT 100;

CREATE OR REPLACE VIEW recent_insights AS
SELECT * FROM ai_insights
ORDER BY timestamp DESC
LIMIT 50;

-- Function to clean old data (keep 30 days)
CREATE OR REPLACE FUNCTION cleanup_old_data()
RETURNS void AS $$
BEGIN
  DELETE FROM market_snapshots WHERE timestamp < NOW() - INTERVAL '30 days';
  DELETE FROM ai_insights WHERE timestamp < NOW() - INTERVAL '30 days';
  DELETE FROM price_history WHERE timestamp < NOW() - INTERVAL '7 days';
END;
$$ LANGUAGE plpgsql;
