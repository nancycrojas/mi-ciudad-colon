import { router, useFocusEffect } from "expo-router";
import { useCallback, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { USUARIO_LOCAL_ID } from "../../config/usuario";
import { obtenerLugarPorId } from "../../servicios/lugares";
import {
  eliminarVisita,
  obtenerVisitasPorUsuario,
} from "../../servicios/visitas";

import type { Visita } from "../../tipos/visitas";

interface VisitaConLugar {
  visita: Visita;
  nombreLugar: string;
}

export default function RecorridoScreen() {
  const [visitas, setVisitas] = useState<VisitaConLugar[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [eliminandoId, setEliminandoId] = useState<string | null>(null);

  useFocusEffect(
    useCallback(() => {
      let activo = true;

      async function cargarVisitas() {
        setCargando(true);
        setError(null);

        try {
          const registros = await obtenerVisitasPorUsuario(USUARIO_LOCAL_ID);

          const visitasConLugar = await Promise.all(
            registros.map(async (visita) => {
              const lugar = await obtenerLugarPorId(visita.lugarId);

              return {
                visita,
                nombreLugar: lugar?.nombre ?? "Lugar no disponible",
              };
            }),
          );

          if (activo) {
            setVisitas(visitasConLugar);
          }
        } catch (error) {
          console.error("Error al cargar visitas:", error);

          if (activo) {
            setError("No se pudieron cargar las visitas.");
          }
        } finally {
          if (activo) {
            setCargando(false);
          }
        }
      }

      void cargarVisitas();

      return () => {
        activo = false;
      };
    }, []),
  );

  function confirmarEliminacion(id: string, nombreLugar: string) {
    Alert.alert(
      "Eliminar visita",
      `¿Querés eliminar la visita a ${nombreLugar} de tu recorrido?`,
      [
        {
          text: "Cancelar",
          style: "cancel",
        },
        {
          text: "Eliminar",
          style: "destructive",
          onPress: () => {
            void quitarVisita(id);
          },
        },
      ],
    );
  }

  async function quitarVisita(id: string) {
    if (eliminandoId !== null) return;

    setEliminandoId(id);

    try {
      await eliminarVisita(id);

      setVisitas((anteriores) =>
        anteriores.filter((item) => item.visita.id !== id),
      );
    } catch (error) {
      console.error("Error al eliminar visita:", error);

      Alert.alert(
        "Error",
        "No se pudo eliminar la visita. Intentá nuevamente.",
      );
    } finally {
      setEliminandoId(null);
    }
  }

  return (
    <SafeAreaView style={styles.contenedor}>
      <Text style={styles.titulo}>Mi recorrido</Text>

      <Text style={styles.descripcion}>
        Consultá los lugares turísticos que visitaste durante tu recorrido por
        Colón.
      </Text>

      <Pressable
        style={styles.botonEscanear}
        onPress={() => router.push("/escanear-qr")}
        accessibilityRole="button"
        accessibilityLabel="Escanear código QR de un lugar turístico"
      >
        <Text style={styles.textoBotonEscanear}>Escanear código QR</Text>
      </Pressable>

      {cargando ? (
        <ActivityIndicator size="large" />
      ) : error ? (
        <Text style={styles.error}>{error}</Text>
      ) : (
        <FlatList
          data={visitas}
          keyExtractor={(item) => item.visita.id}
          contentContainerStyle={styles.lista}
          ListEmptyComponent={
            <Text style={styles.mensaje}>
              Todavía no hay visitas registradas.
            </Text>
          }
          renderItem={({ item }) => (
            <View style={styles.tarjeta}>
              <Text style={styles.nombre}>{item.nombreLugar}</Text>

              <Text style={styles.detalle}>
                Fecha: {new Date(item.visita.fechaHora).toLocaleString("es-AR")}
              </Text>

              <Text style={styles.detalle}>Registro: {item.visita.origen}</Text>

              {item.visita.nota && (
                <Text style={styles.detalle}>Nota: {item.visita.nota}</Text>
              )}

              <Pressable
                style={styles.botonEliminar}
                onPress={() =>
                  confirmarEliminacion(item.visita.id, item.nombreLugar)
                }
                disabled={eliminandoId !== null}
                accessibilityRole="button"
                accessibilityLabel={`Eliminar visita a ${item.nombreLugar}`}
              >
                <Text style={styles.textoEliminar}>
                  {eliminandoId === item.visita.id
                    ? "Eliminando..."
                    : "Eliminar visita"}
                </Text>
              </Pressable>
            </View>
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
    marginBottom: 16,
  },
  descripcion: {
    fontSize: 16,
    color: "#444444",
    lineHeight: 24,
    marginBottom: 24,
  },
  lista: {
    paddingBottom: 24,
  },
  mensaje: {
    fontSize: 15,
    color: "#777777",
    textAlign: "center",
    marginTop: 30,
  },
  error: {
    color: "#B00020",
    fontSize: 15,
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
    marginBottom: 10,
  },
  detalle: {
    fontSize: 14,
    color: "#444444",
    marginBottom: 6,
  },
  botonEliminar: {
    borderWidth: 1,
    borderColor: "#B00020",
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    alignItems: "center",
    marginTop: 12,
  },
  textoEliminar: {
    color: "#B00020",
    fontSize: 14,
    fontWeight: "600",
  },
  botonEscanear: {
    backgroundColor: "#22543D",
    padding: 16,
    borderRadius: 10,
    alignItems: "center",
    marginBottom: 20,
  },
  textoBotonEscanear: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "bold",
  },
});
