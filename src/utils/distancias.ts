import type { Coordenadas } from "../tipos/lugares";

const RADIO_TIERRA_KM = 6371;

function convertirARadianes(grados: number): number {
  return (grados * Math.PI) / 180;
}

export function calcularDistanciaKm(
  origen: Coordenadas,
  destino: Coordenadas,
): number {
  const latitud1 = convertirARadianes(origen.latitud);
  const latitud2 = convertirARadianes(destino.latitud);

  const diferenciaLatitud = convertirARadianes(
    destino.latitud - origen.latitud,
  );

  const diferenciaLongitud = convertirARadianes(
    destino.longitud - origen.longitud,
  );

  const a =
    Math.sin(diferenciaLatitud / 2) ** 2 +
    Math.cos(latitud1) *
      Math.cos(latitud2) *
      Math.sin(diferenciaLongitud / 2) ** 2;

  const distancia =
    2 * RADIO_TIERRA_KM * Math.asin(Math.sqrt(Math.min(1, Math.max(0, a))));

  return distancia;
}
