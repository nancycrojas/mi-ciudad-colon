import { StyleSheet, View } from "react-native";
import MapView, { Marker } from "react-native-maps";

import type { Lugar } from "../tipos/lugares";

interface Props {
  lugares: Lugar[];
  onSeleccionarLugar: (id: string) => void;
  permisoUbicacion: boolean;
}

export default function MapaLugares({
  lugares,
  onSeleccionarLugar,
  permisoUbicacion,
}: Props) {
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
