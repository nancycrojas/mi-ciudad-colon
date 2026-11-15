import { useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { USUARIO_LOCAL_ID } from "../../config/usuario";
import { obtenerLugarPorId } from "../../servicios/lugares";
import {
  obtenerVisitaPorLugar,
  registrarVisita,
} from "../../servicios/visitas";

import type { Lugar } from "../../tipos/lugares";
import type { Visita } from "../../tipos/visitas";

export default function DetalleLugarScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();

  const [lugar, setLugar] = useState<Lugar | null>(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [visitado, setVisitado] = useState(false);
  const [guardando, setGuardando] = useState(false);

  useEffect(() => {
    let activo = true;

    async function cargarLugar() {
      setCargando(true);
      setError(null);
      setLugar(null);
      setVisitado(false);

      try {
        const datos = await obtenerLugarPorId(id);

        if (!datos) {
          if (activo) setLugar(null);
          return;
        }

        const visitaExistente = await obtenerVisitaPorLugar(
          USUARIO_LOCAL_ID,
          datos.id,
        );

        if (activo) {
          setLugar(datos);
          setVisitado(visitaExistente !== null);
        }
      } catch (error) {
        console.error("Error al cargar el lugar:", error);

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

  async function marcarComoVisitado() {
    if (!lugar || guardando || visitado) return;

    setGuardando(true);

    try {
      const visitaExistente = await obtenerVisitaPorLugar(
        USUARIO_LOCAL_ID,
        lugar.id,
      );

      if (visitaExistente) {
        setVisitado(true);
        Alert.alert(
          "Lugar ya registrado",
          "Este lugar ya figura en tu recorrido.",
        );
        return;
      }

      const nuevaVisita: Visita = {
        id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
        usuarioId: USUARIO_LOCAL_ID,
        lugarId: lugar.id,
        fechaHora: new Date().toISOString(),
        origen: "manual",
        fotoUri: null,
        nota: null,
        sincronizada: false,
      };

      await registrarVisita(nuevaVisita);

      setVisitado(true);

      Alert.alert("Visita registrada", "El lugar se agregó a Mi recorrido.");
    } catch (error) {
      console.error("Error al registrar visita:", error);

      Alert.alert("Error", "No se pudo guardar la visita. Intentá nuevamente.");
    } finally {
      setGuardando(false);
    }
  }

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

        <Pressable
          style={[styles.botonVisita, visitado && styles.botonVisitado]}
          onPress={() => void marcarComoVisitado()}
          disabled={visitado || guardando}
          accessibilityRole="button"
          accessibilityLabel={
            visitado ? "Lugar ya visitado" : "Marcar lugar como visitado"
          }
        >
          <Text style={styles.textoBotonVisita}>
            {guardando
              ? "Guardando..."
              : visitado
                ? "Lugar visitado ✓"
                : "Marcar como visitado"}
          </Text>
        </Pressable>

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
  botonVisita: {
    backgroundColor: "#22543D",
    padding: 16,
    borderRadius: 10,
    alignItems: "center",
    marginBottom: 12,
  },
  botonVisitado: {
    backgroundColor: "#607D68",
  },
  textoBotonVisita: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "bold",
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
