import React, { useEffect, useState } from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { auth } from "./firebase";
import MapScreen from "./src/screens/MapScreen";
import InfoScreen from "./src/screens/InfoScreen";
import LoginScreen from "./src/screens/LoginScreen";
import RegisterScreen from "./src/screens/RegisterScreen";
import { Ionicons } from "@expo/vector-icons";

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setIsAuthenticated(!!user); // Atualiza o estado de autenticação
    });

    return () => unsubscribe(); // Limpa o listener
  }, []);

  // Navegação para a tela de Map e Info (Tab Navigator)
  const TabNavigator = () => (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;

          if (route.name === "Mapa") {
            iconName = focused ? "map" : "map-outline";
          } else if (route.name === "Info") {
            iconName = focused
              ? "information-circle"
              : "information-circle-outline";
          }

          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: "#007AFF", // Cor do ícone quando selecionado
        tabBarInactiveTintColor: "gray", // Cor do ícone quando não selecionado
      })}
    >
      <Tab.Screen name="Mapa" component={MapScreen} />
      <Tab.Screen name="Info" component={InfoScreen} />
    </Tab.Navigator>
  );

  // Navegação para a tela de Login e Registro (Stack Navigator)
  const AuthStack = () => (
    <Stack.Navigator>
      <Stack.Screen
        name="Login"
        component={LoginScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="Register"
        component={RegisterScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="Telas"
        component={TabNavigator}
        options={{ headerShown: false }}
      />
    </Stack.Navigator>
  );

  return (
    <NavigationContainer key={isAuthenticated ? "user" : "guest"}>
      {isAuthenticated ? <TabNavigator /> : <AuthStack />}
    </NavigationContainer>
  );
}
