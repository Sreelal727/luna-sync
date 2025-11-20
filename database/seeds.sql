-- Luna Sync Seed Data - Phase 1 MVP
-- Test data for development

-- Test users (password for all: "password123")
-- Password hash generated with bcrypt, cost factor 10
INSERT INTO users (user_id, email, password_hash, first_name, date_of_birth, avg_cycle_length, onboarding_completed) VALUES
  ('550e8400-e29b-41d4-a716-446655440001', 'jane@example.com', '$2b$10$rW3qZ9y0wZ.WqYX0Z9Y0qeY3X0Y0Y0Y0Y0Y0Y0Y0Y0Y0Y0Y0Y0Y0Y', 'Jane', '1995-06-15', 28, TRUE),
  ('550e8400-e29b-41d4-a716-446655440002', 'sarah@example.com', '$2b$10$rW3qZ9y0wZ.WqYX0Z9Y0qeY3X0Y0Y0Y0Y0Y0Y0Y0Y0Y0Y0Y0Y0Y0Y', 'Sarah', '1992-03-22', 30, TRUE),
  ('550e8400-e29b-41d4-a716-446655440003', 'alex@example.com', '$2b$10$rW3qZ9y0wZ.WqYX0Z9Y0qeY3X0Y0Y0Y0Y0Y0Y0Y0Y0Y0Y0Y0Y0Y0Y', 'Alex', '1998-11-08', 27, FALSE);

-- Cycle records for Jane (user 1) - 6 months of history
INSERT INTO cycle_records (user_id, period_start_date, period_end_date, cycle_length, flow_intensity, notes) VALUES
  ('550e8400-e29b-41d4-a716-446655440001', '2025-05-20', '2025-05-25', 28, 'medium', 'Regular cycle'),
  ('550e8400-e29b-41d4-a716-446655440001', '2025-06-17', '2025-06-22', 28, 'heavy', 'Heavier than usual'),
  ('550e8400-e29b-41d4-a716-446655440001', '2025-07-15', '2025-07-20', 28, 'medium', NULL),
  ('550e8400-e29b-41d4-a716-446655440001', '2025-08-12', '2025-08-17', 28, 'medium', NULL),
  ('550e8400-e29b-41d4-a716-446655440001', '2025-09-09', '2025-09-14', 28, 'light', NULL),
  ('550e8400-e29b-41d4-a716-446655440001', '2025-10-07', '2025-10-12', 28, 'medium', NULL),
  ('550e8400-e29b-41d4-a716-446655440001', '2025-11-04', '2025-11-08', NULL, 'medium', 'Current cycle');

-- Cycle records for Sarah (user 2) - 3 months of history
INSERT INTO cycle_records (user_id, period_start_date, period_end_date, cycle_length, flow_intensity) VALUES
  ('550e8400-e29b-41d4-a716-446655440002', '2025-08-22', '2025-08-27', 30, 'medium'),
  ('550e8400-e29b-41d4-a716-446655440002', '2025-09-21', '2025-09-26', 30, 'medium'),
  ('550e8400-e29b-41d4-a716-446655440002', '2025-10-21', '2025-10-25', 30, 'light');

-- Mood logs for Jane - last 14 days
INSERT INTO mood_logs (user_id, log_date, mood, energy_level, symptoms, flow_intensity, notes, is_private) VALUES
  ('550e8400-e29b-41d4-a716-446655440001', '2025-11-04', 'calm', 5, '["cramps", "bloating"]'::jsonb, 'medium', 'Period started', TRUE),
  ('550e8400-e29b-41d4-a716-446655440001', '2025-11-05', 'irritable', 4, '["cramps", "fatigue", "headache"]'::jsonb, 'heavy', 'Rough day', TRUE),
  ('550e8400-e29b-41d4-a716-446655440001', '2025-11-06', 'calm', 6, '["cramps"]'::jsonb, 'medium', 'Feeling better', TRUE),
  ('550e8400-e29b-41d4-a716-446655440001', '2025-11-07', 'happy', 7, '[]'::jsonb, 'light', NULL, TRUE),
  ('550e8400-e29b-41d4-a716-446655440001', '2025-11-08', 'energetic', 8, '[]'::jsonb, 'none', 'Period ended', TRUE),
  ('550e8400-e29b-41d4-a716-446655440001', '2025-11-09', 'happy', 8, '[]'::jsonb, 'none', NULL, TRUE),
  ('550e8400-e29b-41d4-a716-446655440001', '2025-11-10', 'calm', 7, '[]'::jsonb, 'none', NULL, TRUE),
  ('550e8400-e29b-41d4-a716-446655440001', '2025-11-11', 'energetic', 9, '[]'::jsonb, 'none', 'Great energy today!', TRUE),
  ('550e8400-e29b-41d4-a716-446655440001', '2025-11-12', 'happy', 8, '[]'::jsonb, 'none', NULL, TRUE),
  ('550e8400-e29b-41d4-a716-446655440001', '2025-11-13', 'calm', 7, '[]'::jsonb, 'none', NULL, TRUE),
  ('550e8400-e29b-41d4-a716-446655440001', '2025-11-14', 'happy', 9, '[]'::jsonb, 'none', NULL, TRUE),
  ('550e8400-e29b-41d4-a716-446655440001', '2025-11-15', 'energetic', 8, '[]'::jsonb, 'none', NULL, TRUE),
  ('550e8400-e29b-41d4-a716-446655440001', '2025-11-16', 'happy', 8, '[]'::jsonb, 'none', NULL, TRUE),
  ('550e8400-e29b-41d4-a716-446655440001', '2025-11-17', 'calm', 7, '[]'::jsonb, 'none', NULL, TRUE);

-- Mood logs for Sarah - last 7 days
INSERT INTO mood_logs (user_id, log_date, mood, energy_level, symptoms, flow_intensity) VALUES
  ('550e8400-e29b-41d4-a716-446655440002', '2025-11-11', 'happy', 8, '[]'::jsonb, 'none'),
  ('550e8400-e29b-41d4-a716-446655440002', '2025-11-12', 'energetic', 9, '[]'::jsonb, 'none'),
  ('550e8400-e29b-41d4-a716-446655440002', '2025-11-13', 'calm', 7, '[]'::jsonb, 'none'),
  ('550e8400-e29b-41d4-a716-446655440002', '2025-11-14', 'happy', 8, '["cravings"]'::jsonb, 'none'),
  ('550e8400-e29b-41d4-a716-446655440002', '2025-11-15', 'calm', 6, '["bloating"]'::jsonb, 'none'),
  ('550e8400-e29b-41d4-a716-446655440002', '2025-11-16', 'anxious', 5, '["bloating", "mood_swings"]'::jsonb, 'none'),
  ('550e8400-e29b-41d4-a716-446655440002', '2025-11-17', 'irritable', 4, '["cramps", "fatigue"]'::jsonb, 'none');
