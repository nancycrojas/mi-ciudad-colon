import { router } from "expo-router";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  StyleSheet,
  Text,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { obtenerLugares } from "../servicios/lugares";
import type { Lugar } from "../tipos/lugares";

export default function HomeScreen() {
  const [lugares, setLugares] = useState<Lugar[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function cargarLugares() {
      try {
        const datos = await obtenerLugares();
        setLugares(datos);
      } catch {
        setError("No se pudieron cargar los lugares.");
      } finally {
        setCargando(false);
      }
    }

    void cargarLugares();
  }, []);

  return (
    <SafeAreaView style={styles.contenedor}>
      <Text style={styles.titulo}>Mi Ciudad Colón</Text>
      <Text style={styles.subtitulo}>Descubrí los atractivos turísticos</Text>

      {cargando ? (
        <ActivityIndicator size="large" />
      ) : error ? (
        <Text style={styles.error}>{error}</Text>
      ) : (
        <FlatList
          data={lugares}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.lista}
          ListEmptyComponent={<Text>No hay lugares disponibles.</Text>}
          renderItem={({ item }) => (
            <Pressable
              style={styles.tarjeta}
              onPress={() => {
                console.log("Tocaste el lugar:", item.nombre);

                router.push({
                  pathname: "/lugar/[id]",
                  params: { id: item.id },
                });
              }}
              accessibilityRole="button"
              accessibilityLabel={`Ver detalles de ${item.nombre}`}
            >
              <Text style={styles.nombre}>{item.nombre}</Text>

              <Text style={styles.descripcion}>{item.descripcionCorta}</Text>

              <Text style={styles.direccion}>{item.direccion}</Text>
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
    marginBottom: 8,
  },
  subtitulo: {
    fontSize: 16,
    color: "#555555",
    marginBottom: 24,
  },
  lista: {
    paddingBottom: 24,
  },
  tarjeta: {
    backgroundColor: "#FFFFFF",
    padding: 18,
    borderRadius: 12,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: "#E0E5E0",
  },
  nombre: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#22543D",
    marginBottom: 8,
  },
  descripcion: {
    fontSize: 15,
    color: "#444444",
    marginBottom: 8,
  },
  direccion: {
    fontSize: 13,
    color: "#777777",
  },
  error: {
    color: "#B00020",
    fontSize: 16,
  },
});
