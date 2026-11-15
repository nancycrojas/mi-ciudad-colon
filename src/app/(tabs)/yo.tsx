import { router, useFocusEffect } from "expo-router";
import { useCallback, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  StyleSheet,
  Text,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { USUARIO_LOCAL_ID } from "../../config/usuario";
import { obtenerFavoritosPorUsuario } from "../../servicios/favoritos";
import { obtenerLugarPorId } from "../../servicios/lugares";

import type { Favorito } from "../../tipos/favoritos";

interface FavoritoConLugar {
  favorito: Favorito;
  nombreLugar: string;
  descripcionCorta: string;
}

export default function YoScreen() {
  const [favoritos, setFavoritos] = useState<FavoritoConLugar[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useFocusEffect(
    useCallback(() => {
      let activo = true;

      async function cargarFavoritos() {
        setCargando(true);
        setError(null);

        try {
          const registros = await obtenerFavoritosPorUsuario(USUARIO_LOCAL_ID);

          const favoritosConLugar = await Promise.all(
            registros.map(async (favorito) => {
              const lugar = await obtenerLugarPorId(favorito.lugarId);

              return {
                favorito,
                nombreLugar: lugar?.nombre ?? "Lugar no disponible",
                descripcionCorta: lugar?.descripcionCorta ?? "",
              };
            }),
          );

          if (activo) {
            setFavoritos(favoritosConLugar);
          }
        } catch (error) {
          console.error("Error al cargar favoritos:", error);

          if (activo) {
            setError("No se pudieron cargar los favoritos.");
          }
        } finally {
          if (activo) {
            setCargando(false);
          }
        }
      }

      void cargarFavoritos();

      return () => {
        activo = false;
      };
    }, []),
  );

  return (
    <SafeAreaView style={styles.contenedor}>
      <Text style={styles.titulo}>Mi cuenta</Text>

      <Text style={styles.descripcion}>
        Desde aquí podrás administrar tu cuenta, tus favoritos y tus
        preferencias.
      </Text>

      <Text style={styles.mensajeCuenta}>No hay una sesión iniciada.</Text>

      <Text style={styles.tituloSeccion}>Mis favoritos</Text>

      {cargando ? (
        <ActivityIndicator size="large" />
      ) : error ? (
        <Text style={styles.error}>{error}</Text>
      ) : (
        <FlatList
          data={favoritos}
          keyExtractor={(item) => item.favorito.id}
          contentContainerStyle={styles.lista}
          ListEmptyComponent={
            <Text style={styles.mensaje}>
              Todavía no agregaste lugares a favoritos.
            </Text>
          }
          renderItem={({ item }) => (
            <Pressable
              style={styles.tarjeta}
              onPress={() =>
                router.push({
                  pathname: "/lugar/[id]",
                  params: { id: item.favorito.lugarId },
                })
              }
              accessibilityRole="button"
              accessibilityLabel={`Ver detalles de ${item.nombreLugar}`}
            >
              <Text style={styles.nombre}>{item.nombreLugar}</Text>

              {item.descripcionCorta !== "" && (
                <Text style={styles.detalle}>{item.descripcionCorta}</Text>
              )}

              <Text style={styles.verDetalle}>Ver detalle</Text>
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
    marginBottom: 16,
  },
  descripcion: {
    fontSize: 16,
    color: "#444444",
    lineHeight: 24,
    marginBottom: 16,
  },
  mensajeCuenta: {
    fontSize: 14,
    color: "#777777",
    marginBottom: 24,
  },
  tituloSeccion: {
    fontSize: 21,
    fontWeight: "bold",
    color: "#22543D",
    marginBottom: 16,
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
    fontSize: 15,
    color: "#B00020",
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
    fontSize: 19,
    fontWeight: "bold",
    color: "#22543D",
    marginBottom: 8,
  },
  detalle: {
    fontSize: 14,
    color: "#444444",
    lineHeight: 21,
    marginBottom: 10,
  },
  verDetalle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#22543D",
  },
});
