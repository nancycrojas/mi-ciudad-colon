import { DarkTheme, DefaultTheme, Stack, ThemeProvider } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { useColorScheme } from "react-native";

import { AnimatedSplashOverlay } from "@/components/animated-icon";

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const colorScheme = useColorScheme();

  return (
    <ThemeProvider value={colorScheme === "dark" ? DarkTheme : DefaultTheme}>
      <AnimatedSplashOverlay />

      <Stack>
        <Stack.Screen name="index" options={{ title: "Mi Ciudad Colón" }} />

        <Stack.Screen
          name="lugar/[id]"
          options={{ title: "Detalle del lugar" }}
        />

        <Stack.Screen name="explore" options={{ title: "Explorar" }} />
        <Stack.Screen name="agenda" options={{ title: "Agenda de eventos" }} />
        <Stack.Screen
          name="evento/[id]"
          options={{ title: "Detalle del evento" }}
        />
      </Stack>
    </ThemeProvider>
  );
}
