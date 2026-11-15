import type { Favorito } from "../tipos/favoritos";
import { obtenerBaseDatos } from "./baseDatos";

export async function agregarFavorito(favorito: Favorito): Promise<void> {
  const db = await obtenerBaseDatos();

  await db.runAsync(
    `INSERT OR IGNORE INTO favoritos (
      id, usuarioId, lugarId, creadoEn
    ) VALUES (?, ?, ?, ?)`,
    [favorito.id, favorito.usuarioId, favorito.lugarId, favorito.creadoEn],
  );
}

export async function obtenerFavoritosPorUsuario(
  usuarioId: string,
): Promise<Favorito[]> {
  const db = await obtenerBaseDatos();

  return db.getAllAsync<Favorito>(
    `SELECT id, usuarioId, lugarId, creadoEn
     FROM favoritos
     WHERE usuarioId = ?
     ORDER BY creadoEn DESC`,
    [usuarioId],
  );
}

export async function obtenerFavoritoPorLugar(
  usuarioId: string,
  lugarId: string,
): Promise<Favorito | null> {
  const db = await obtenerBaseDatos();

  return db.getFirstAsync<Favorito>(
    `SELECT id, usuarioId, lugarId, creadoEn
     FROM favoritos
     WHERE usuarioId = ? AND lugarId = ?
     LIMIT 1`,
    [usuarioId, lugarId],
  );
}

export async function eliminarFavorito(
  usuarioId: string,
  lugarId: string,
): Promise<void> {
  const db = await obtenerBaseDatos();

  await db.runAsync(
    `DELETE FROM favoritos
     WHERE usuarioId = ? AND lugarId = ?`,
    [usuarioId, lugarId],
  );
}
