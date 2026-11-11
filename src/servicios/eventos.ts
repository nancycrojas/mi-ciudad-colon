import { eventos } from "../mocks/eventos";
import type { Evento } from "../tipos/eventos";

export async function obtenerEventos(): Promise<Evento[]> {
  const ahora = new Date().getTime();

  return eventos
    .filter((evento) => {
      const finalizacion = evento.fin ?? evento.inicio;

      return new Date(finalizacion).getTime() >= ahora;
    })
    .sort(
      (a, b) => new Date(a.inicio).getTime() - new Date(b.inicio).getTime(),
    );
}

export async function obtenerEventoPorId(id: string): Promise<Evento | null> {
  const evento = eventos.find((item) => item.id === id);

  return evento ?? null;
}
