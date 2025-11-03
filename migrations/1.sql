
-- Tabla de distritos
CREATE TABLE distritos (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  nombre TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insertar distritos iniciales
INSERT INTO distritos (nombre) VALUES
  ('Arganzuela'),
  ('Retiro'),
  ('Chamartín'),
  ('Salamanca'),
  ('Moncloa'),
  ('Fuencarral'),
  ('Latina');

-- Tabla de usuarios permitidos
CREATE TABLE usuarios (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  email TEXT NOT NULL UNIQUE,
  nombre TEXT,
  is_admin BOOLEAN DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insertar administrador
INSERT INTO usuarios (email, nombre, is_admin) VALUES
  ('rubencejudomateos@gmail.com', 'Rubén Cejudo Mateos', 1);

-- Tabla de inventario (mint_sve)
CREATE TABLE mint_sve (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  id_elemento TEXT NOT NULL,
  nombre_elemento TEXT NOT NULL,
  tipo_inventario TEXT NOT NULL,
  distrito_id INTEGER,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_mint_sve_tipo ON mint_sve(tipo_inventario);
CREATE INDEX idx_mint_sve_distrito ON mint_sve(distrito_id);

-- Tabla de actuaciones
CREATE TABLE actuaciones (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  nombre_actuacion TEXT NOT NULL,
  distrito_id INTEGER,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_actuaciones_distrito ON actuaciones(distrito_id);

-- Tabla de programas
CREATE TABLE programas (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  nombre_programa TEXT NOT NULL,
  id_actuacion INTEGER NOT NULL,
  fecha_inicio DATE,
  fecha_fin DATE,
  distrito_id INTEGER,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_programas_actuacion ON programas(id_actuacion);
CREATE INDEX idx_programas_distrito ON programas(distrito_id);

-- Tabla de ejecuciones programadas
CREATE TABLE ejecuciones_programadas (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  id_programa INTEGER NOT NULL,
  id_elemento INTEGER,
  fecha_inicio DATE NOT NULL,
  fecha_fin DATE,
  periodicidad TEXT DEFAULT 'Única',
  repeticiones_max INTEGER,
  estado TEXT DEFAULT 'Pendiente',
  asignado_a TEXT,
  notas TEXT,
  imagen_1_url TEXT,
  imagen_2_url TEXT,
  distrito_id INTEGER,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_ejecuciones_programa ON ejecuciones_programadas(id_programa);
CREATE INDEX idx_ejecuciones_elemento ON ejecuciones_programadas(id_elemento);
CREATE INDEX idx_ejecuciones_asignado ON ejecuciones_programadas(asignado_a);
CREATE INDEX idx_ejecuciones_estado ON ejecuciones_programadas(estado);
CREATE INDEX idx_ejecuciones_fecha_inicio ON ejecuciones_programadas(fecha_inicio);
CREATE INDEX idx_ejecuciones_distrito ON ejecuciones_programadas(distrito_id);
