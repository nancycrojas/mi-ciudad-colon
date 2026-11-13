import * as Location from "expo-location";
import { router } from "expo-router";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import MapaLugares from "../../components/MapaLugares";
import { obtenerCategorias } from "../../servicios/categorias";
import { obtenerLugares } from "../../servicios/lugares";
import type { Categoria } from "../../tipos/categorias";
import type { Coordenadas, Lugar } from "../../tipos/lugares";
import { calcularDistanciaKm } from "../../utils/distancias";

export default function HomeScreen() {
  const [lugares, setLugares] = useState<Lugar[]>([]);
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [busqueda, setBusqueda] = useState("");
  const [ordenarPorCercania, setOrdenarPorCercania] = useState(false);
  const [categoriaSeleccionada, setCategoriaSeleccionada] = useState<
    string | null
  >(null);
  const [permisoUbicacion, setPermisoUbicacion] = useState(false);
  const [ubicacionActual, setUbicacionActual] = useState<Coordenadas | null>(
    null,
  );

  const lugaresFiltrados = lugares.filter((lugar) => {
    const coincideNombre = lugar.nombre
      .toLowerCase()
      .includes(busqueda.trim().toLowerCase());

    const coincideCategoria =
      categoriaSeleccionada === null ||
      lugar.categoriaId === categoriaSeleccionada;

    return coincideNombre && coincideCategoria;
  });

  const lugaresOrdenados =
    ordenarPorCercania && ubicacionActual
      ? [...lugaresFiltrados].sort(
          (a, b) =>
            calcularDistanciaKm(ubicacionActual, a.coordenadas) -
            calcularDistanciaKm(ubicacionActual, b.coordenadas),
        )
      : lugaresFiltrados;

  function abrirDetalleLugar(id: string) {
    router.push({
      pathname: "/lugar/[id]",
      params: { id },
    });
  }

  useEffect(() => {
    let activo = true;

    async function cargarLugares() {
      try {
        const datos = await obtenerLugares();

        if (activo) {
          setLugares(datos);
        }
      } catch {
        if (activo) {
          setError("No se pudieron cargar los lugares.");
        }
      } finally {
        if (activo) {
          setCargando(false);
        }
      }
    }

    void cargarLugares();

    return () => {
      activo = false;
    };
  }, []);

  useEffect(() => {
    let activo = true;

    async function cargarCategorias() {
      try {
        const datos = await obtenerCategorias();

        if (activo) {
          setCategorias(datos);
        }
      } catch (error) {
        console.error("Error al cargar categorías:", error);
      }
    }

    void cargarCategorias();

    return () => {
      activo = false;
    };
  }, []);

  useEffect(() => {
    let activo = true;

    async function obtenerUbicacion() {
      try {
        const permiso = await Location.requestForegroundPermissionsAsync();

        if (!activo) return;

        const autorizado = permiso.status === "granted";
        setPermisoUbicacion(autorizado);

        if (!autorizado) return;

        const posicion = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.Balanced,
        });

        if (activo) {
          setUbicacionActual({
            latitud: posicion.coords.latitude,
            longitud: posicion.coords.longitude,
          });
        }
      } catch (error) {
        console.error("Error al obtener la ubicación:", error);
      }
    }

    void obtenerUbicacion();

    return () => {
      activo = false;
    };
  }, []);

  return (
    <SafeAreaView style={styles.contenedor}>
      <FlatList
        data={cargando || error ? [] : lugaresOrdenados}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.lista}
        keyboardShouldPersistTaps="handled"
        ListHeaderComponent={
          <View>
            <Text style={styles.titulo}>Mi Ciudad Colón</Text>

            <Text style={styles.subtitulo}>
              Descubrí los atractivos turísticos
            </Text>

            <Pressable
              style={styles.botonAgenda}
              onPress={() => router.push("/agenda")}
              accessibilityRole="button"
              accessibilityLabel="Ver agenda de eventos"
            >
              <Text style={styles.textoBotonAgenda}>Ver agenda de eventos</Text>
            </Pressable>

            <TextInput
              style={styles.buscador}
              placeholder="Buscar lugares turísticos..."
              placeholderTextColor="#777777"
              value={busqueda}
              onChangeText={setBusqueda}
              autoCorrect={false}
              accessibilityLabel="Buscar lugares turísticos"
            />

            <Pressable
              style={styles.botonOrdenar}
              onPress={() => setOrdenarPorCercania((anterior) => !anterior)}
              disabled={!ubicacionActual}
              accessibilityRole="button"
            >
              <Text style={styles.textoBotonOrdenar}>
                {ordenarPorCercania
                  ? "Orden: más cercanos primero ✓"
                  : "Ordenar por cercanía"}
              </Text>
            </Pressable>

            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              style={styles.contenedorCategorias}
              contentContainerStyle={styles.listaCategorias}
              keyboardShouldPersistTaps="handled"
            >
              <Pressable
                onPress={() => setCategoriaSeleccionada(null)}
                style={[
                  styles.botonCategoria,
                  categoriaSeleccionada === null &&
                    styles.botonCategoriaSeleccionada,
                ]}
              >
                <Text
                  style={[
                    styles.textoCategoria,
                    categoriaSeleccionada === null &&
                      styles.textoCategoriaSeleccionada,
                  ]}
                >
                  Todas
                </Text>
              </Pressable>

              {categorias.map((categoria) => {
                const seleccionada = categoriaSeleccionada === categoria.id;

                return (
                  <Pressable
                    key={categoria.id}
                    onPress={() => setCategoriaSeleccionada(categoria.id)}
                    style={[
                      styles.botonCategoria,
                      seleccionada && styles.botonCategoriaSeleccionada,
                    ]}
                  >
                    <Text
                      style={[
                        styles.textoCategoria,
                        seleccionada && styles.textoCategoriaSeleccionada,
                      ]}
                    >
                      {categoria.nombre}
                    </Text>
                  </Pressable>
                );
              })}
            </ScrollView>

            {!cargando && !error && (
              <>
                <Text style={styles.tituloSeccion}>Mapa turístico</Text>

                <MapaLugares
                  lugares={lugaresOrdenados}
                  onSeleccionarLugar={abrirDetalleLugar}
                  permisoUbicacion={permisoUbicacion}
                />

                <Text style={styles.tituloSeccion}>Lugares turísticos</Text>
              </>
            )}
          </View>
        }
        ListEmptyComponent={
          cargando ? (
            <ActivityIndicator size="large" />
          ) : error ? (
            <Text style={styles.error}>{error}</Text>
          ) : (
            <Text>No hay lugares disponibles.</Text>
          )
        }
        renderItem={({ item }) => (
          <Pressable
            style={styles.tarjeta}
            onPress={() => abrirDetalleLugar(item.id)}
            accessibilityRole="button"
            accessibilityLabel={`Ver detalles de ${item.nombre}`}
          >
            <Text style={styles.nombre}>{item.nombre}</Text>

            <Text style={styles.descripcion}>{item.descripcionCorta}</Text>

            <Text style={styles.direccion}>{item.direccion}</Text>

            <Text style={styles.distancia}>
              {ubicacionActual
                ? `A ${calcularDistanciaKm(
                    ubicacionActual,
                    item.coordenadas,
                  ).toFixed(1)} km de tu ubicación`
                : "Distancia no disponible"}
            </Text>
          </Pressable>
        )}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  contenedor: {
    flex: 1,
    backgroundColor: "#F5F7F5",
    paddingHorizontal: 20,
    paddingTop: 20,
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
  tituloSeccion: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#22543D",
    marginBottom: 12,
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
  buscador: {
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#CCCCCC",
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 16,
    color: "#333333",
    marginBottom: 16,
  },
  contenedorCategorias: {
    flexGrow: 0,
    height: 80,
    marginBottom: 16,
  },
  listaCategorias: {
    gap: 8,
    paddingRight: 12,
    paddingTop: 6,
    paddingBottom: 10,
    alignItems: "center",
  },
  botonCategoria: {
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 16,
    paddingVertical: 12,
    minHeight: 48,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: "#CCCCCC",
    justifyContent: "center",
    alignItems: "center",
  },
  botonCategoriaSeleccionada: {
    backgroundColor: "#22543D",
    borderColor: "#22543D",
  },
  textoCategoria: {
    color: "#333333",
    fontSize: 14,
    lineHeight: 20,
    includeFontPadding: true,
    textAlign: "center",
  },
  textoCategoriaSeleccionada: {
    color: "#FFFFFF",
    fontWeight: "bold",
  },
  botonAgenda: {
    backgroundColor: "#22543D",
    paddingVertical: 14,
    paddingHorizontal: 18,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
  },
  textoBotonAgenda: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "bold",
    textAlign: "center",
  },
  distancia: {
    fontSize: 13,
    color: "#22543D",
    fontWeight: "600",
    marginTop: 10,
  },
  botonOrdenar: {
    backgroundColor: "#E2EEE6",
    padding: 12,
    borderRadius: 10,
    marginBottom: 12,
    alignItems: "center",
  },
  textoBotonOrdenar: {
    color: "#22543D",
    fontSize: 14,
    fontWeight: "600",
  },
});
