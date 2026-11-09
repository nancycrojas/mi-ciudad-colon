import { useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";
import { ActivityIndicator, ScrollView, StyleSheet, Text } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { obtenerLugarPorId } from "../../servicios/lugares";
import type { Lugar } from "../../tipos/lugares";

export default function DetalleLugarScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();

  const [lugar, setLugar] = useState<Lugar | null>(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let activo = true;

    async function cargarLugar() {
      setCargando(true);
      setError(null);
      setLugar(null);

      try {
        const datos = await obtenerLugarPorId(id);

        if (activo) {
          setLugar(datos);
        }
      } catch {
        if (activo) {
          setError("No se pudo cargar el lugar.");
        }
      } finally {
        if (activo) {
          setCargando(false);
        }
      }
    }

    void cargarLugar();

    return () => {
      activo = false;
    };
  }, [id]);

  if (cargando) {
    return (
      <SafeAreaView style={styles.contenedor}>
        <ActivityIndicator size="large" />
      </SafeAreaView>
    );
  }

  if (error || !lugar) {
    return (
      <SafeAreaView style={styles.contenedor}>
        <Text style={styles.mensaje}>
          {error ?? "No se encontró el lugar."}
        </Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.contenedor}>
      <ScrollView contentContainerStyle={styles.contenido}>
        <Text style={styles.titulo}>{lugar.nombre}</Text>

        <Text style={styles.descripcionCorta}>{lugar.descripcionCorta}</Text>

        <Text style={styles.seccion}>Descripción</Text>
        <Text style={styles.texto}>{lugar.descripcion}</Text>

        <Text style={styles.seccion}>Dirección</Text>
        <Text style={styles.texto}>{lugar.direccion}</Text>

        <Text style={styles.seccion}>Horarios</Text>
        {lugar.horarios.length > 0 ? (
          lugar.horarios.map((horario) => (
            <Text key={horario.dia} style={styles.texto}>
              Día {horario.dia}: {horario.abre} a {horario.cierra}
            </Text>
          ))
        ) : (
          <Text style={styles.texto}>Horarios no disponibles.</Text>
        )}

        <Text style={styles.seccion}>Precio de entrada</Text>
        <Text style={styles.texto}>
          {lugar.precioEntrada === null
            ? "Precio no informado"
            : lugar.precioEntrada === 0
              ? "Entrada gratuita"
              : `$${lugar.precioEntrada}`}
        </Text>

        <Text style={styles.seccion}>Teléfono</Text>
        <Text style={styles.texto}>{lugar.telefono ?? "No disponible"}</Text>

        <Text style={styles.seccion}>Audioguía</Text>
        <Text style={styles.texto}>
          {lugar.audioguia
            ? "Audioguía disponible"
            : "Sin audioguía disponible"}
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
    marginBottom: 12,
  },
  descripcionCorta: {
    fontSize: 17,
    color: "#555555",
    marginBottom: 20,
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
  mensaje: {
    fontSize: 16,
    color: "#444444",
    padding: 20,
  },
});
