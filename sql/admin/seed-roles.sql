INSERT INTO roles (role_name, description, permissions) VALUES
('ADMIN', 'Full system access with all permissions', '{"create": true, "read": true, "update": true, "delete": true, "manage_users": true, "manage_roles": true}'::jsonb),
('AUTHOR', 'Can create and manage own content', '{"create": true, "read": true, "update": true, "delete": false, "manage_users": false, "manage_roles": false}'::jsonb),
('EDIT', 'Can edit existing content', '{"create": false, "read": true, "update": true, "delete": false, "manage_users": false, "manage_roles": false}'::jsonb),
('READ_ONLY', 'View-only access to content', '{"create": false, "read": true, "update": false, "delete": false, "manage_users": false, "manage_roles": false}'::jsonb)
