-- Script para inicializar la tabla views_availabe con vistas comunes
-- Ejecutar después de crear las tablas

-- Insertar vistas comunes para una aplicación de running/fitness
INSERT INTO views_availabe (view_name) VALUES 
('dashboard') ON CONFLICT (view_name) DO NOTHING,
('profile') ON CONFLICT (view_name) DO NOTHING,
('training') ON CONFLICT (view_name) DO NOTHING,
('training_history') ON CONFLICT (view_name) DO NOTHING,
('training_create') ON CONFLICT (view_name) DO NOTHING,
('training_detail') ON CONFLICT (view_name) DO NOTHING,
('stats') ON CONFLICT (view_name) DO NOTHING,
('achievements') ON CONFLICT (view_name) DO NOTHING,
('rewards') ON CONFLICT (view_name) DO NOTHING,
('social') ON CONFLICT (view_name) DO NOTHING,
('friends') ON CONFLICT (view_name) DO NOTHING,
('leaderboard') ON CONFLICT (view_name) DO NOTHING,
('settings') ON CONFLICT (view_name) DO NOTHING,
('notifications') ON CONFLICT (view_name) DO NOTHING,
('chatbot') ON CONFLICT (view_name) DO NOTHING,
('nutrition') ON CONFLICT (view_name) DO NOTHING,
('equipment') ON CONFLICT (view_name) DO NOTHING,
('recovery') ON CONFLICT (view_name) DO NOTHING,
('goals') ON CONFLICT (view_name) DO NOTHING,
('challenges') ON CONFLICT (view_name) DO NOTHING;

-- Verificar las vistas insertadas
SELECT id, view_name FROM views_availabe ORDER BY view_name; 