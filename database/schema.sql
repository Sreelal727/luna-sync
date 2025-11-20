-- Luna Sync Database Schema - Phase 1 MVP
-- PostgreSQL 14+

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table
CREATE TABLE users (
  user_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  first_name VARCHAR(100),
  date_of_birth DATE,
  avg_cycle_length INT DEFAULT 28 CHECK (avg_cycle_length BETWEEN 21 AND 35),
  onboarding_completed BOOLEAN DEFAULT FALSE,
  subscription_tier VARCHAR(20) DEFAULT 'free' CHECK (subscription_tier IN ('free', 'premium', 'partner_pro')),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Cycle records table
CREATE TABLE cycle_records (
  record_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(user_id) ON DELETE CASCADE NOT NULL,
  period_start_date DATE NOT NULL,
  period_end_date DATE,
  cycle_length INT,
  flow_intensity VARCHAR(20) CHECK (flow_intensity IN ('spotting', 'light', 'medium', 'heavy')),
  notes TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  CONSTRAINT valid_period_dates CHECK (period_end_date IS NULL OR period_end_date >= period_start_date)
);

-- Mood logs table
CREATE TABLE mood_logs (
  log_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(user_id) ON DELETE CASCADE NOT NULL,
  log_date DATE NOT NULL,
  mood VARCHAR(50) CHECK (mood IN ('happy', 'calm', 'sad', 'anxious', 'irritable', 'energetic')),
  energy_level INT CHECK (energy_level BETWEEN 1 AND 10),
  symptoms JSONB DEFAULT '[]'::jsonb,
  flow_intensity VARCHAR(20) CHECK (flow_intensity IN ('spotting', 'light', 'medium', 'heavy', 'none')),
  notes TEXT,
  is_private BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT NOW(),
  CONSTRAINT unique_user_date UNIQUE (user_id, log_date)
);

-- Partner links table (for future Phase 3)
CREATE TABLE partner_links (
  link_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  primary_user_id UUID REFERENCES users(user_id) ON DELETE CASCADE NOT NULL,
  partner_user_id UUID REFERENCES users(user_id) ON DELETE CASCADE,
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'active', 'paused', 'revoked')),
  share_fertility BOOLEAN DEFAULT FALSE,
  share_period_dates BOOLEAN DEFAULT TRUE,
  invite_token VARCHAR(255) UNIQUE,
  expires_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Insights table (for future Phase 2)
CREATE TABLE insights (
  insight_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(user_id) ON DELETE CASCADE NOT NULL,
  insight_type VARCHAR(50) CHECK (insight_type IN ('phase_tip', 'pattern_detection', 'prediction')),
  content TEXT NOT NULL,
  cycle_day INT,
  generated_at TIMESTAMP DEFAULT NOW(),
  viewed BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Subscriptions table (for future Phase 4)
CREATE TABLE subscriptions (
  subscription_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(user_id) ON DELETE CASCADE NOT NULL,
  tier VARCHAR(20) NOT NULL CHECK (tier IN ('premium', 'partner_pro')),
  billing_cycle VARCHAR(10) CHECK (billing_cycle IN ('monthly', 'annual')),
  start_date TIMESTAMP NOT NULL,
  end_date TIMESTAMP,
  is_trial BOOLEAN DEFAULT FALSE,
  is_active BOOLEAN DEFAULT TRUE,
  payment_provider VARCHAR(50) CHECK (payment_provider IN ('stripe', 'apple', 'google')),
  external_subscription_id VARCHAR(255),
  created_at TIMESTAMP DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_cycle_records_user ON cycle_records(user_id, period_start_date DESC);
CREATE INDEX idx_mood_logs_user_date ON mood_logs(user_id, log_date DESC);
CREATE INDEX idx_partner_links_users ON partner_links(primary_user_id, partner_user_id);
CREATE INDEX idx_insights_user ON insights(user_id, generated_at DESC);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_cycle_records_updated_at BEFORE UPDATE ON cycle_records
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_partner_links_updated_at BEFORE UPDATE ON partner_links
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Comments for documentation
COMMENT ON TABLE users IS 'Primary users (menstruating individuals)';
COMMENT ON TABLE cycle_records IS 'Period tracking records with start/end dates';
COMMENT ON TABLE mood_logs IS 'Daily mood and symptom logs';
COMMENT ON TABLE partner_links IS 'Connections between primary users and their partners';
COMMENT ON TABLE insights IS 'AI-generated personalized insights';
COMMENT ON TABLE subscriptions IS 'Premium subscription management';
