import { eventos } from "../mocks/eventos";
import type { Evento } from "../tipos/eventos";

export async function obtenerEventos(): Promise<Evento[]> {
  return [...eventos].sort(
    (a, b) => new Date(a.inicio).getTime() - new Date(b.inicio).getTime(),
  );
}

export async function obtenerEventoPorId(id: string): Promise<Evento | null> {
  const evento = eventos.find((item) => item.id === id);

  return evento ?? null;
}
