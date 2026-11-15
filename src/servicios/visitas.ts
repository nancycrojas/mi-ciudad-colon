import type { Visita } from "../tipos/visitas";
import { obtenerBaseDatos } from "./baseDatos";

interface VisitaFila {
  id: string;
  usuarioId: string;
  lugarId: string;
  fechaHora: string;
  origen: Visita["origen"];
  fotoUri: string | null;
  nota: string | null;
  sincronizada: number;
}

function convertirFilaAVisita(fila: VisitaFila): Visita {
  return {
    id: fila.id,
    usuarioId: fila.usuarioId,
    lugarId: fila.lugarId,
    fechaHora: fila.fechaHora,
    origen: fila.origen,
    fotoUri: fila.fotoUri,
    nota: fila.nota,
    sincronizada: fila.sincronizada === 1,
  };
}

export async function registrarVisita(visita: Visita): Promise<void> {
  const db = await obtenerBaseDatos();

  await db.runAsync(
    `INSERT INTO visitas (
      id, usuarioId, lugarId, fechaHora,
      origen, fotoUri, nota, sincronizada
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      visita.id,
      visita.usuarioId,
      visita.lugarId,
      visita.fechaHora,
      visita.origen,
      visita.fotoUri,
      visita.nota,
      visita.sincronizada ? 1 : 0,
    ],
  );
}

export async function obtenerVisitasPorUsuario(
  usuarioId: string,
): Promise<Visita[]> {
  const db = await obtenerBaseDatos();

  const filas = await db.getAllAsync<VisitaFila>(
    `SELECT * FROM visitas
     WHERE usuarioId = ?
     ORDER BY fechaHora DESC`,
    [usuarioId],
  );

  return filas.map(convertirFilaAVisita);
}

export async function obtenerVisitaPorLugar(
  usuarioId: string,
  lugarId: string,
): Promise<Visita | null> {
  const db = await obtenerBaseDatos();

  const fila = await db.getFirstAsync<VisitaFila>(
    `SELECT * FROM visitas
     WHERE usuarioId = ? AND lugarId = ?
     ORDER BY fechaHora DESC
     LIMIT 1`,
    [usuarioId, lugarId],
  );

  return fila ? convertirFilaAVisita(fila) : null;
}

export async function eliminarVisita(id: string): Promise<void> {
  const db = await obtenerBaseDatos();

  await db.runAsync("DELETE FROM visitas WHERE id = ?", [id]);
}
