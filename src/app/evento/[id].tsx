import { useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";
import { ActivityIndicator, ScrollView, StyleSheet, Text } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { obtenerEventoPorId } from "../../servicios/eventos";
import { obtenerLugarPorId } from "../../servicios/lugares";
import type { Evento } from "../../tipos/eventos";
import type { Lugar } from "../../tipos/lugares";

export default function DetalleEventoScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();

  const [evento, setEvento] = useState<Evento | null>(null);
  const [lugarAsociado, setLugarAsociado] = useState<Lugar | null>(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let activo = true;

    async function cargarEvento() {
      setCargando(true);
      setError(null);
      setEvento(null);

      try {
        const datos = await obtenerEventoPorId(id);

        let lugar: Lugar | null = null;

        if (datos?.lugarId) {
          lugar = await obtenerLugarPorId(datos.lugarId);
        }

        if (activo) {
          setEvento(datos);
          setLugarAsociado(lugar);
        }
      } catch {
        if (activo) {
          setError("No se pudo cargar el evento.");
        }
      } finally {
        if (activo) {
          setCargando(false);
        }
      }
    }

    void cargarEvento();

    return () => {
      activo = false;
    };
  }, [id]);

  function formatearFecha(fecha: string) {
    return new Date(fecha).toLocaleString("es-AR", {
      day: "2-digit",
      month: "long",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      timeZone: "America/Argentina/Buenos_Aires",
    });
  }

  if (cargando) {
    return (
      <SafeAreaView style={styles.contenedor}>
        <ActivityIndicator size="large" />
      </SafeAreaView>
    );
  }

  if (error || !evento) {
    return (
      <SafeAreaView style={styles.contenedor}>
        <Text style={styles.mensaje}>
          {error ?? "No se encontró el evento."}
        </Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.contenedor}>
      <ScrollView contentContainerStyle={styles.contenido}>
        <Text style={styles.titulo}>{evento.titulo}</Text>

        <Text style={styles.seccion}>Descripción</Text>
        <Text style={styles.texto}>{evento.descripcion}</Text>

        <Text style={styles.seccion}>Fecha de inicio</Text>
        <Text style={styles.texto}>{formatearFecha(evento.inicio)}</Text>

        <Text style={styles.seccion}>Fecha de finalización</Text>
        <Text style={styles.texto}>
          {evento.fin ? formatearFecha(evento.fin) : "No informada"}
        </Text>

        <Text style={styles.seccion}>Ubicación</Text>

        <Text style={styles.texto}>
          {lugarAsociado
            ? `${lugarAsociado.nombre}\n${lugarAsociado.direccion}`
            : (evento.direccionLibre ??
              (evento.lugarId
                ? "No se pudo obtener la información del lugar."
                : "Ubicación no informada"))}
        </Text>

        <Text style={styles.seccion}>Precio</Text>
        <Text style={styles.texto}>
          {evento.precio === null
            ? "Precio no informado"
            : evento.precio === 0
              ? "Actividad gratuita"
              : `$${evento.precio}`}
        </Text>

        <Text style={styles.seccion}>Estado</Text>
        <Text
          style={[
            styles.texto,
            evento.estado === "cancelado" || evento.estado === "suspendido"
              ? styles.estadoAdvertencia
              : null,
          ]}
        >
          {evento.estado}
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  contenedor: {
    flex: 1,
    backgroundColor: "#F5F7F5",
  },
  contenido: {
    padding: 20,
    paddingBottom: 40,
  },
  titulo: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#22543D",
    marginBottom: 16,
  },
  seccion: {
    fontSize: 19,
    fontWeight: "bold",
    color: "#22543D",
    marginTop: 18,
    marginBottom: 8,
  },
  texto: {
    fontSize: 16,
    color: "#444444",
    lineHeight: 24,
  },
  estadoAdvertencia: {
    color: "#B00020",
    fontWeight: "bold",
  },
  mensaje: {
    fontSize: 16,
    color: "#444444",
    padding: 20,
  },
});
