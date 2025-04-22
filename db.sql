
CREATE TABLE IF NOT EXISTS roles (
    id SERIAL PRIMARY KEY,
    name VARCHAR(50) NOT NULL,
    permissions TEXT[] DEFAULT '{}'::TEXT[]
);

CREATE TABLE permissions (
  id SERIAL PRIMARY KEY,
  name VARCHAR(50) UNIQUE NOT NULL
);

-- Creamos la tabla pivot para roles y permisos si no existe
CREATE TABLE IF NOT EXISTS role_permissions (
    role_id INTEGER REFERENCES roles(id),
    permission_id INTEGER REFERENCES permissions(id),
    PRIMARY KEY (role_id, permission_id)
);

CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  username VARCHAR(50) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL, -- Almacenará el hash bcrypt
  role_id INTEGER REFERENCES roles(id),
  last_login TIMESTAMP
);

CREATE TABLE products (
  id SERIAL PRIMARY KEY,
  code VARCHAR(50) UNIQUE NOT NULL,
  name VARCHAR(100) NOT NULL,
  description TEXT,
  quantity INTEGER NOT NULL,
  price DECIMAL(10, 2) NOT NULL
);

-- Tabla de roles
INSERT INTO roles (name) VALUES 
  ('SuperAdmin'),
  ('Auditor'),
  ('Registrador');

-- Tabla de permisos
INSERT INTO permissions (name) VALUES 
  ('Crear'),
  ('Editar'),
  ('Borrar'),
  ('Ver Reportes');

-- Insertamos los roles
INSERT INTO roles (id, name) VALUES 
(1, 'SuperAdmin'),
(2, 'Auditor'),
(3, 'Registrador');

-- Asignamos permisos al SuperAdmin (id: 1)
INSERT INTO role_permissions (role_id, permission_id)
SELECT 1, id FROM permissions;  -- SuperAdmin tiene todos los permisos

-- Asignamos permisos al Auditor (id: 2)
INSERT INTO role_permissions (role_id, permission_id)
SELECT 2, id FROM permissions 
WHERE name IN ('ver_usuarios', 'ver_productos');

-- Asignamos permisos al Registrador (id: 3)
INSERT INTO role_permissions (role_id, permission_id)
SELECT 3, id FROM permissions 
WHERE name IN (
    'ver_usuarios',
    'crear_productos',
    'editar_productos',
    'borrar_productos',
    'ver_productos'
);

-- Insertar un usuario con contraseña encriptada (bcrypt hash para "password123")
INSERT INTO users (username, password, role_id) VALUES (
  'testuser',
  '$2b$10$usoC9CQ97.oWaAHX4vgTUu7wCz0bn4oLy.uBbQLejnqmTKhikQWm2', -- bcrypt hash de "password123"
  1 -- role_id 
);