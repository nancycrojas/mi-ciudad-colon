import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  StyleSheet,
  Text,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { router } from "expo-router";
import { obtenerEventos } from "../../servicios/eventos";
import type { Evento } from "../../tipos/eventos";

export default function AgendaScreen() {
  const [eventos, setEventos] = useState<Evento[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let activo = true;

    async function cargarEventos() {
      try {
        const datos = await obtenerEventos();

        if (activo) {
          setEventos(datos);
        }
      } catch {
        if (activo) {
          setError("No se pudieron cargar los eventos.");
        }
      } finally {
        if (activo) {
          setCargando(false);
        }
      }
    }

    void cargarEventos();

    return () => {
      activo = false;
    };
  }, []);

  function formatearFecha(fecha: string) {
    return new Date(fecha).toLocaleString("es-AR", {
      day: "2-digit",
      month: "long",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  }

  return (
    <SafeAreaView style={styles.contenedor}>
      <Text style={styles.titulo}>Agenda de eventos</Text>

      {cargando ? (
        <ActivityIndicator size="large" />
      ) : error ? (
        <Text style={styles.error}>{error}</Text>
      ) : (
        <FlatList
          data={eventos}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.lista}
          ListEmptyComponent={<Text>No hay eventos disponibles.</Text>}
          renderItem={({ item }) => (
            <Pressable
              style={styles.tarjeta}
              onPress={() =>
                router.push({
                  pathname: "/evento/[id]",
                  params: { id: item.id },
                })
              }
              accessibilityRole="button"
              accessibilityLabel={`Ver detalles de ${item.titulo}`}
            >
              <Text style={styles.nombre}>{item.titulo}</Text>

              <Text style={styles.fecha}>{formatearFecha(item.inicio)}</Text>

              <Text style={styles.descripcion}>{item.descripcion}</Text>

              <Text style={styles.estado}>Estado: {item.estado}</Text>

              <Text style={styles.precio}>
                {item.precio === null
                  ? "Precio no informado"
                  : item.precio === 0
                    ? "Entrada gratuita"
                    : `$${item.precio}`}
              </Text>
            </Pressable>
          )}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  contenedor: {
    flex: 1,
    backgroundColor: "#F5F7F5",
    padding: 20,
  },
  titulo: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#22543D",
    marginBottom: 20,
  },
  lista: {
    paddingBottom: 30,
  },
  tarjeta: {
    backgroundColor: "#FFFFFF",
    padding: 18,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E0E5E0",
    marginBottom: 14,
  },
  nombre: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#22543D",
    marginBottom: 8,
  },
  fecha: {
    fontSize: 14,
    color: "#555555",
    marginBottom: 8,
  },
  descripcion: {
    fontSize: 15,
    color: "#444444",
    marginBottom: 10,
  },
  estado: {
    fontSize: 14,
    color: "#555555",
    marginBottom: 6,
  },
  precio: {
    fontSize: 14,
    color: "#444444",
  },
  error: {
    color: "#B00020",
    fontSize: 16,
  },
});
