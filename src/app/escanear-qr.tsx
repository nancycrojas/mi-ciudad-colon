import {
  CameraView,
  useCameraPermissions,
  type BarcodeScanningResult,
} from "expo-camera";
import { router, useFocusEffect } from "expo-router";
import { useCallback, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { USUARIO_LOCAL_ID } from "../config/usuario";
import { obtenerLugarPorId } from "../servicios/lugares";
import { obtenerVisitaPorLugar, registrarVisita } from "../servicios/visitas";

import type { Visita } from "../tipos/visitas";

export default function EscanearQRScreen() {
  const [permiso, solicitarPermiso] = useCameraPermissions();
  const [procesando, setProcesando] = useState(false);
  const [escaneoHabilitado, setEscaneoHabilitado] = useState(true);

  const bloqueoEscaneo = useRef(false);
  const pantallaActiva = useRef(true);

  useFocusEffect(
    useCallback(() => {
      pantallaActiva.current = true;

      return () => {
        pantallaActiva.current = false;
        bloqueoEscaneo.current = true;
      };
    }, []),
  );

  function reiniciarEscaneo() {
    bloqueoEscaneo.current = false;
    setProcesando(false);
    setEscaneoHabilitado(true);
  }

  async function procesarCodigo(codigo: BarcodeScanningResult) {
    if (bloqueoEscaneo.current) return;

    bloqueoEscaneo.current = true;
    setEscaneoHabilitado(false);
    setProcesando(true);

    try {
      const lugarId = codigo.data.trim();

      const lugar = await obtenerLugarPorId(lugarId);

      if (!pantallaActiva.current) return;

      if (!lugar) {
        Alert.alert(
          "Código no reconocido",
          "Este código QR no corresponde a un lugar turístico registrado.",
          [
            {
              text: "Escanear otro",
              onPress: reiniciarEscaneo,
            },
          ],
        );
        return;
      }

      const visitaExistente = await obtenerVisitaPorLugar(
        USUARIO_LOCAL_ID,
        lugar.id,
      );

      if (!pantallaActiva.current) return;

      if (visitaExistente) {
        Alert.alert(
          "Lugar ya visitado",
          `${lugar.nombre} ya figura en Mi recorrido.`,
          [
            {
              text: "Escanear otro",
              onPress: reiniciarEscaneo,
            },
            {
              text: "Mi recorrido",
              onPress: () => router.back(),
            },
          ],
        );
        return;
      }

      Alert.alert(
        "Registrar visita",
        `¿Querés registrar tu visita a ${lugar.nombre}?`,
        [
          {
            text: "Cancelar",
            style: "cancel",
            onPress: reiniciarEscaneo,
          },
          {
            text: "Registrar",
            onPress: () => {
              void guardarVisita(lugar.id, lugar.nombre);
            },
          },
        ],
      );
    } catch (error) {
      console.error("Error al procesar QR:", error);

      if (!pantallaActiva.current) return;

      Alert.alert("Error", "No se pudo procesar el código QR.", [
        {
          text: "Reintentar",
          onPress: reiniciarEscaneo,
        },
      ]);
    } finally {
      if (pantallaActiva.current) {
        setProcesando(false);
      }
    }
  }

  async function guardarVisita(lugarId: string, nombreLugar: string) {
    setProcesando(true);

    try {
      const existente = await obtenerVisitaPorLugar(USUARIO_LOCAL_ID, lugarId);

      if (existente) {
        Alert.alert(
          "Lugar ya visitado",
          "Este lugar ya figura en Mi recorrido.",
          [
            {
              text: "Volver",
              onPress: () => router.back(),
            },
          ],
        );
        return;
      }

      const nuevaVisita: Visita = {
        id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
        usuarioId: USUARIO_LOCAL_ID,
        lugarId,
        fechaHora: new Date().toISOString(),
        origen: "qr",
        fotoUri: null,
        nota: null,
        sincronizada: false,
      };

      await registrarVisita(nuevaVisita);

      if (!pantallaActiva.current) return;

      Alert.alert(
        "Visita registrada",
        `${nombreLugar} se agregó a Mi recorrido.`,
        [
          {
            text: "Ver mi recorrido",
            onPress: () => router.back(),
          },
        ],
      );
    } catch (error) {
      console.error("Error al registrar visita por QR:", error);

      if (!pantallaActiva.current) return;

      Alert.alert("Error", "No se pudo guardar la visita.", [
        {
          text: "Reintentar",
          onPress: reiniciarEscaneo,
        },
      ]);
    } finally {
      if (pantallaActiva.current) {
        setProcesando(false);
      }
    }
  }

  if (!permiso) {
    return (
      <SafeAreaView style={styles.contenedor}>
        <ActivityIndicator size="large" />
      </SafeAreaView>
    );
  }

  if (!permiso.granted) {
    return (
      <SafeAreaView style={styles.contenedor}>
        <Text style={styles.titulo}>Escanear código QR</Text>

        <Text style={styles.descripcion}>
          Necesitamos acceder a la cámara para leer el código QR de un lugar
          turístico.
        </Text>

        <Pressable style={styles.boton} onPress={() => void solicitarPermiso()}>
          <Text style={styles.textoBoton}>Permitir acceso a la cámara</Text>
        </Pressable>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.contenedor}>
      <Text style={styles.titulo}>Escanear código QR</Text>

      <Text style={styles.descripcion}>
        Apuntá la cámara hacia el código QR del lugar turístico.
      </Text>

      <CameraView
        style={styles.camara}
        facing="back"
        barcodeScannerSettings={{
          barcodeTypes: ["qr"],
        }}
        onBarcodeScanned={escaneoHabilitado ? procesarCodigo : undefined}
      />

      {procesando && (
        <View style={styles.estado}>
          <ActivityIndicator size="small" />
          <Text style={styles.textoEstado}>Procesando código...</Text>
        </View>
      )}

      <Pressable style={styles.botonSecundario} onPress={() => router.back()}>
        <Text style={styles.textoBotonSecundario}>Volver a Mi recorrido</Text>
      </Pressable>
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
    fontSize: 26,
    fontWeight: "bold",
    color: "#22543D",
    marginBottom: 12,
  },
  descripcion: {
    fontSize: 16,
    color: "#444444",
    lineHeight: 24,
    marginBottom: 20,
  },
  camara: {
    flex: 1,
    borderRadius: 12,
    overflow: "hidden",
  },
  estado: {
    padding: 14,
    alignItems: "center",
    gap: 8,
  },
  textoEstado: {
    color: "#444444",
    fontSize: 14,
  },
  boton: {
    backgroundColor: "#22543D",
    padding: 16,
    borderRadius: 10,
    alignItems: "center",
  },
  textoBoton: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "bold",
  },
  botonSecundario: {
    padding: 16,
    alignItems: "center",
    marginTop: 12,
  },
  textoBotonSecundario: {
    color: "#22543D",
    fontSize: 15,
    fontWeight: "600",
  },
});
