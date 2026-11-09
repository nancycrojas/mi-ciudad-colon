import { lugares } from "../mocks/lugares";
import type { Lugar } from "../tipos/lugares";

export async function obtenerLugares(): Promise<Lugar[]> {
  return lugares;
}

export async function obtenerLugarPorId(id: string): Promise<Lugar | null> {
  const lugar = lugares.find((item) => item.id === id);

  return lugar ?? null;
}
