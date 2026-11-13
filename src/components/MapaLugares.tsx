import * as Location from "expo-location";
import { useEffect, useState } from "react";
import { StyleSheet, View } from "react-native";
import MapView, { Marker } from "react-native-maps";

import type { Lugar } from "../tipos/lugares";

interface Props {
  lugares: Lugar[];
  onSeleccionarLugar: (id: string) => void;
}

export default function MapaLugares({ lugares, onSeleccionarLugar }: Props) {
  const [permisoUbicacion, setPermisoUbicacion] = useState(false);

  useEffect(() => {
    let activo = true;

    async function solicitarPermiso() {
      try {
        const permiso = await Location.requestForegroundPermissionsAsync();

        if (activo) {
          setPermisoUbicacion(permiso.status === "granted");
        }
      } catch (error) {
        console.error("No se pudo solicitar el permiso de ubicación:", error);
      }
    }

    void solicitarPermiso();

    return () => {
      activo = false;
    };
  }, []);

  return (
    <View style={styles.contenedor}>
      <MapView
        style={styles.mapa}
        showsUserLocation={permisoUbicacion}
        showsMyLocationButton={permisoUbicacion}
        initialRegion={{
          latitude: -32.2231,
          longitude: -58.1443,
          latitudeDelta: 0.25,
          longitudeDelta: 0.25,
        }}
      >
        {lugares.map((lugar) => (
          <Marker
            key={lugar.id}
            coordinate={{
              latitude: lugar.coordenadas.latitud,
              longitude: lugar.coordenadas.longitud,
            }}
            title={lugar.nombre}
            onCalloutPress={() => onSeleccionarLugar(lugar.id)}
          />
        ))}
      </MapView>
    </View>
  );
}

const styles = StyleSheet.create({
  contenedor: {
    height: 300,
    width: "100%",
    marginBottom: 16,
    borderRadius: 12,
    overflow: "hidden",
  },
  mapa: {
    width: "100%",
    height: "100%",
  },
});
