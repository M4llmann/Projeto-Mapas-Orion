import React, { useEffect, useState } from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { auth } from "./firebase";
import MapScreen from "./screens/MapScreen";
import InfoScreen from "./screens/InfoScreen";
import LoginScreen from "./screens/LoginScreen";
import RegisterScreen from "./screens/RegisterScreen";
import PropriedadeScreen from "./screens/PropriedadeScreen";
import TesteScreen from "./screens/TesteScreen";

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
    <Tab.Navigator>
      <Tab.Screen name="Mapa" component={MapScreen} />
      <Tab.Screen name="Info" component={InfoScreen} />
      <Tab.Screen name="Propriedade" component={PropriedadeScreen} />
      <Tab.Screen name="Teste" component={TesteScreen} />
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
    <NavigationContainer>
      {isAuthenticated ? <TabNavigator /> : <AuthStack />}
    </NavigationContainer>
  );
}
