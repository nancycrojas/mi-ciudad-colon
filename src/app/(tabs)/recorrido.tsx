import { router, useFocusEffect } from "expo-router";
import { useCallback, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { USUARIO_LOCAL_ID } from "../../config/usuario";
import { obtenerLugarPorId } from "../../servicios/lugares";
import {
  actualizarNotaVisita,
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

  const [editandoId, setEditandoId] = useState<string | null>(null);
  const [textoNota, setTextoNota] = useState("");
  const [guardandoNota, setGuardandoNota] = useState(false);

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

  function comenzarEdicion(visita: Visita) {
    if (guardandoNota || eliminandoId !== null) return;

    setEditandoId(visita.id);
    setTextoNota(visita.nota ?? "");
  }

  function cancelarEdicion() {
    if (guardandoNota) return;

    setEditandoId(null);
    setTextoNota("");
  }

  async function guardarNota(id: string) {
    if (guardandoNota || eliminandoId !== null) return;

    setGuardandoNota(true);

    const nota = textoNota.trim() || null;

    try {
      await actualizarNotaVisita(id, nota);

      setVisitas((anteriores) =>
        anteriores.map((item) =>
          item.visita.id === id
            ? {
                ...item,
                visita: {
                  ...item.visita,
                  nota,
                  sincronizada: false,
                },
              }
            : item,
        ),
      );

      setEditandoId(null);
      setTextoNota("");

      Alert.alert("Nota guardada", "La nota se guardó correctamente.");
    } catch (error) {
      console.error("Error al guardar nota:", error);

      Alert.alert("Error", "No se pudo guardar la nota. Intentá nuevamente.");
    } finally {
      setGuardandoNota(false);
    }
  }

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
    if (eliminandoId !== null || guardandoNota) return;

    setEliminandoId(id);

    try {
      await eliminarVisita(id);

      setVisitas((anteriores) =>
        anteriores.filter((item) => item.visita.id !== id),
      );

      if (editandoId === id) {
        setEditandoId(null);
        setTextoNota("");
      }
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
          keyboardShouldPersistTaps="handled"
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

              {editandoId === item.visita.id ? (
                <View style={styles.editorNota}>
                  <Text style={styles.etiquetaNota}>
                    Tu nota sobre este lugar
                  </Text>

                  <TextInput
                    style={styles.campoNota}
                    value={textoNota}
                    onChangeText={setTextoNota}
                    placeholder="Escribí cómo fue tu visita..."
                    multiline
                    maxLength={1000}
                    textAlignVertical="top"
                    editable={!guardandoNota}
                    accessibilityLabel="Nota de la visita"
                  />

                  <Text style={styles.contador}>
                    {textoNota.length}/1000 caracteres
                  </Text>

                  <View style={styles.accionesNota}>
                    <Pressable
                      style={styles.botonCancelar}
                      onPress={cancelarEdicion}
                      disabled={guardandoNota}
                      accessibilityRole="button"
                    >
                      <Text style={styles.textoCancelar}>Cancelar</Text>
                    </Pressable>

                    <Pressable
                      style={styles.botonGuardar}
                      onPress={() => void guardarNota(item.visita.id)}
                      disabled={guardandoNota}
                      accessibilityRole="button"
                    >
                      <Text style={styles.textoGuardar}>
                        {guardandoNota ? "Guardando..." : "Guardar nota"}
                      </Text>
                    </Pressable>
                  </View>
                </View>
              ) : (
                <>
                  {item.visita.nota ? (
                    <Text style={styles.nota}>Nota: {item.visita.nota}</Text>
                  ) : null}

                  <Pressable
                    style={styles.botonNota}
                    onPress={() => comenzarEdicion(item.visita)}
                    disabled={guardandoNota || eliminandoId !== null}
                    accessibilityRole="button"
                  >
                    <Text style={styles.textoBotonNota}>
                      {item.visita.nota ? "Editar nota" : "Agregar nota"}
                    </Text>
                  </Pressable>
                </>
              )}

              <Pressable
                style={styles.botonEliminar}
                onPress={() =>
                  confirmarEliminacion(item.visita.id, item.nombreLugar)
                }
                disabled={eliminandoId !== null || guardandoNota}
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
  nota: {
    fontSize: 15,
    color: "#444444",
    lineHeight: 22,
    marginTop: 10,
  },
  botonNota: {
    borderWidth: 1,
    borderColor: "#22543D",
    borderRadius: 8,
    padding: 12,
    alignItems: "center",
    marginTop: 12,
  },
  textoBotonNota: {
    color: "#22543D",
    fontSize: 14,
    fontWeight: "600",
  },
  editorNota: {
    marginTop: 14,
  },
  etiquetaNota: {
    fontSize: 15,
    fontWeight: "600",
    color: "#22543D",
    marginBottom: 8,
  },
  campoNota: {
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#C8D5CC",
    borderRadius: 8,
    padding: 12,
    minHeight: 110,
    fontSize: 15,
    color: "#333333",
  },
  contador: {
    fontSize: 12,
    color: "#777777",
    textAlign: "right",
    marginTop: 5,
  },
  accionesNota: {
    flexDirection: "row",
    gap: 10,
    marginTop: 12,
  },
  botonCancelar: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#777777",
    borderRadius: 8,
    padding: 12,
    alignItems: "center",
  },
  textoCancelar: {
    color: "#555555",
    fontSize: 14,
    fontWeight: "600",
  },
  botonGuardar: {
    flex: 1,
    backgroundColor: "#22543D",
    borderRadius: 8,
    padding: 12,
    alignItems: "center",
  },
  textoGuardar: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "600",
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
