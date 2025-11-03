
DROP INDEX IF EXISTS idx_ejecuciones_distrito;
DROP INDEX IF EXISTS idx_ejecuciones_fecha_inicio;
DROP INDEX IF EXISTS idx_ejecuciones_estado;
DROP INDEX IF EXISTS idx_ejecuciones_asignado;
DROP INDEX IF EXISTS idx_ejecuciones_elemento;
DROP INDEX IF EXISTS idx_ejecuciones_programa;
DROP TABLE IF EXISTS ejecuciones_programadas;

DROP INDEX IF EXISTS idx_programas_distrito;
DROP INDEX IF EXISTS idx_programas_actuacion;
DROP TABLE IF EXISTS programas;

DROP INDEX IF EXISTS idx_actuaciones_distrito;
DROP TABLE IF EXISTS actuaciones;

DROP INDEX IF EXISTS idx_mint_sve_distrito;
DROP INDEX IF EXISTS idx_mint_sve_tipo;
DROP TABLE IF EXISTS mint_sve;

DROP TABLE IF EXISTS usuarios;
DROP TABLE IF EXISTS distritos;
