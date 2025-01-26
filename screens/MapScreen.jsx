import React, { useEffect, useState } from "react";
import { View, Alert, StyleSheet } from "react-native";
import { getAuth, onAuthStateChanged, signOut } from "firebase/auth";
import { useNavigation } from "@react-navigation/native";
import Map, { Marker } from "react-native-maps";
import { TouchableOpacity, Text } from "react-native";
import { getPropertyCoordinates } from "../utils/getPropertyCoordinates"; // Caminho do arquivo de função

const MapScreen = () => {
  const navigation = useNavigation();
  const auth = getAuth();
  const [region, setRegion] = useState({
    latitude: -24.563907, // Coordenadas padrão
    longitude: -54.0645,
    latitudeDelta: 0.05,
    longitudeDelta: 0.05,
  });
  const [selectedCoordinate, setSelectedCoordinate] = useState(null); // Para definir o marcador no mapa

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        console.log("Usuário autenticado:", user.uid);

        try {
          const coordenadas = await getPropertyCoordinates(user.uid);
          console.log("Coordenadas recebidas:", coordenadas);

          if (coordenadas) {
            const { latitude, longitude } = coordenadas;

            // Atualiza a região do mapa e o marcador.
            setRegion({
              latitude,
              longitude,
              latitudeDelta: 0.01, // Zoom ajustado para foco maior
              longitudeDelta: 0.01,
            });
            setSelectedCoordinate({ latitude, longitude });
          } else {
            console.log("Usuário não possui propriedades ou coordenadas.");
          }
        } catch (error) {
          console.error("Erro ao buscar coordenadas:", error);
          Alert.alert("Erro", "Não foi possível carregar as coordenadas.");
        }
      } else {
        Alert.alert("Erro", "Usuário não autenticado");
      }
    });

    return unsubscribe; // Remove o listener ao desmontar o componente.
  }, []);

  const handleLogout = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      Alert.alert("Erro", error.message);
    }
  };

  return (
    <View style={styles.container}>
      <Map
        style={styles.map}
        region={region}
        onRegionChangeComplete={(newRegion) => setRegion(newRegion)} // Mantém o controle da região ao mover o mapa
      >
        {selectedCoordinate && (
          <Marker
            coordinate={selectedCoordinate} // Mostra o marcador nas coordenadas definidas
            title="Propriedade"
            description="Primeira propriedade do usuário"
          />
        )}
      </Map>

      <TouchableOpacity onPress={handleLogout} style={styles.logoutButton}>
        <Text style={styles.buttonText}>Logout</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "flex-start",
    alignItems: "center",
  },
  map: {
    width: "100%",
    height: "90%",
  },
  logoutButton: {
    width: "100%",
    padding: 10,
    backgroundColor: "#007bff",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 5,
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
  },
});

export default MapScreen;
