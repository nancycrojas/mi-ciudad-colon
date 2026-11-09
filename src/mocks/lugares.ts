import type { Lugar } from "../tipos/lugares";

export const lugares: Lugar[] = [
  {
    id: "lug-004",
    nombre: "Molino Forclaz",
    categoriaId: "cat-museos",
    descripcionCorta: "Molino de viento de 1888 levantado por colonos suizos.",
    descripcion:
      "Construido en 1888 por Juan Bautista Forclaz, es uno de los atractivos históricos de la región.",
    coordenadas: {
      latitud: -32.1904,
      longitud: -58.1932,
    },
    direccion: "Colonia San José, Ruta Provincial 26",
    imagenes: [],
    horarios: [
      {
        dia: 2,
        abre: "09:00",
        cierra: "19:00",
      },
      {
        dia: 6,
        abre: "10:00",
        cierra: "20:00",
      },
    ],
    telefono: "345-4421234",
    sitioWeb: null,
    precioEntrada: 1500,
    audioguia: null,
    codigoQr: "COLON:lug-004",
    accesible: false,
    activo: true,
    actualizadoEn: "2026-08-01T10:30:00-03:00",
  },

  {
    id: "lug-005",
    nombre: "Termas de Colón",
    categoriaId: "cat-termas",
    descripcionCorta: "Complejo turístico de piscinas termales.",
    descripcion:
      "Las Termas de Colón ofrecen piscinas de aguas termales y espacios de descanso para disfrutar durante una visita a la ciudad.",
    coordenadas: {
      latitud: -32.216,
      longitud: -58.135,
    },
    direccion: "Colón, Entre Ríos",
    imagenes: [],
    horarios: [],
    telefono: null,
    sitioWeb: null,
    precioEntrada: null,
    audioguia: null,
    codigoQr: null,
    accesible: false,
    activo: true,
    actualizadoEn: "2026-11-01T10:00:00-03:00",
  },

  {
    id: "lug-006",
    nombre: "Parque Nacional El Palmar",
    categoriaId: "cat-naturaleza",
    descripcionCorta: "Área natural protegida con palmares y senderos.",
    descripcion:
      "El Parque Nacional El Palmar conserva extensos palmares de yatay y ambientes naturales característicos de Entre Ríos. Los visitantes pueden recorrer senderos, observar aves y disfrutar de paisajes naturales. La aplicación deberá permitir consultar información del parque incluso cuando no haya conexión a Internet.",
    coordenadas: {
      latitud: -31.87,
      longitud: -58.32,
    },
    direccion: "Ruta Nacional 14, Entre Ríos",
    imagenes: [],
    horarios: [],
    telefono: null,
    sitioWeb: null,
    precioEntrada: null,
    audioguia: null,
    codigoQr: null,
    accesible: false,
    activo: true,
    actualizadoEn: "2026-11-01T10:00:00-03:00",
  },
];
