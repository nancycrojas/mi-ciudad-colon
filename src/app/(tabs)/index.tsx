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
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { obtenerCategorias } from "../../servicios/categorias";
import { obtenerLugares } from "../../servicios/lugares";
import type { Categoria } from "../../tipos/categorias";
import type { Lugar } from "../../tipos/lugares";

export default function HomeScreen() {
  const [lugares, setLugares] = useState<Lugar[]>([]);
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [busqueda, setBusqueda] = useState("");
  const [categoriaSeleccionada, setCategoriaSeleccionada] = useState<
    string | null
  >(null);

  const lugaresFiltrados = lugares.filter((lugar) => {
    const coincideNombre = lugar.nombre
      .toLowerCase()
      .includes(busqueda.trim().toLowerCase());

    const coincideCategoria =
      categoriaSeleccionada === null ||
      lugar.categoriaId === categoriaSeleccionada;

    return coincideNombre && coincideCategoria;
  });

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

  return (
    <SafeAreaView style={styles.contenedor}>
      <Text style={styles.titulo}>Mi Ciudad Colón</Text>
      <Text style={styles.subtitulo}>Descubrí los atractivos turísticos</Text>

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

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.contenedorCategorias}
        contentContainerStyle={styles.listaCategorias}
      >
        <Pressable
          onPress={() => setCategoriaSeleccionada(null)}
          style={[
            styles.botonCategoria,
            categoriaSeleccionada === null && styles.botonCategoriaSeleccionada,
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

      {cargando ? (
        <ActivityIndicator size="large" />
      ) : error ? (
        <Text style={styles.error}>{error}</Text>
      ) : (
        <FlatList
          data={lugaresFiltrados}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.lista}
          ListEmptyComponent={<Text>No hay lugares disponibles.</Text>}
          renderItem={({ item }) => (
            <Pressable
              style={styles.tarjeta}
              onPress={() => {
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
});
