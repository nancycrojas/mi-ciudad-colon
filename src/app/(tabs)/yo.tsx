import { StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function YoScreen() {
  return (
    <SafeAreaView style={styles.contenedor}>
      <View>
        <Text style={styles.titulo}>Mi cuenta</Text>

        <Text style={styles.descripcion}>
          Desde aquí podrás administrar tu cuenta, tus favoritos y tus
          preferencias.
        </Text>

        <Text style={styles.mensaje}>No hay una sesión iniciada.</Text>
      </View>
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
  mensaje: {
    fontSize: 15,
    color: "#777777",
    textAlign: "center",
    marginTop: 30,
  },
});
