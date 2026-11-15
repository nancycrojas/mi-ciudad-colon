import * as SQLite from "expo-sqlite";

let inicializacion: Promise<SQLite.SQLiteDatabase> | null = null;

async function inicializarBaseDatos(): Promise<SQLite.SQLiteDatabase> {
  const db = await SQLite.openDatabaseAsync("mi-ciudad-colon.db");

  await db.execAsync(`
    PRAGMA journal_mode = WAL;

    CREATE TABLE IF NOT EXISTS visitas (
      id TEXT PRIMARY KEY NOT NULL,
      usuarioId TEXT NOT NULL,
      lugarId TEXT NOT NULL,
      fechaHora TEXT NOT NULL,
      origen TEXT NOT NULL,
      fotoUri TEXT,
      nota TEXT,
      sincronizada INTEGER NOT NULL DEFAULT 0
    );

    CREATE INDEX IF NOT EXISTS idx_visitas_usuario
    ON visitas (usuarioId, fechaHora);
  `);

  return db;
}

export function obtenerBaseDatos(): Promise<SQLite.SQLiteDatabase> {
  if (inicializacion === null) {
    inicializacion = inicializarBaseDatos().catch((error) => {
      inicializacion = null;
      throw error;
    });
  }

  return inicializacion;
}
