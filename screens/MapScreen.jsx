import React, { useEffect, useState, useRef } from "react";
import { View, Alert, StyleSheet } from "react-native";
import { getAuth, onAuthStateChanged, signOut } from "firebase/auth";
import { useNavigation } from "@react-navigation/native";
import MapView, { Marker } from "react-native-maps"; // Alterei para MapView
import { TouchableOpacity, Text } from "react-native";
import { getPropertyCoordinates } from "../utils/getPropertyCoordinates"; // Caminho do arquivo de função

const MapScreen = () => {
  const navigation = useNavigation();
  const auth = getAuth();
  const mapRef = useRef(null); // Referência para o MapView

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
            const newRegion = {
              latitude,
              longitude,
              latitudeDelta: 0.01, // Zoom ajustado para foco maior
              longitudeDelta: 0.01,
            };
            setRegion(newRegion); // Atualiza o estado da região

            // Anima a transição para a nova região
            if (mapRef.current) {
              mapRef.current.animateToRegion(newRegion, 2000); // Animação de 1 segundo
            }

            // Atualiza o marcador com as coordenadas recebidas
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

    return unsubscribe;
  }, [auth]); // Adicione 'auth' como dependência

  const handleLogout = async () => {
    try {
      await signOut(auth);

      setRegion(null);
      setSelectedCoordinate(null); // Remove o marcador
    } catch (error) {
      Alert.alert("Erro", error.message);
    }
  };
  console.log("Coordenadas do marcador:", selectedCoordinate);

  return (
    <View style={styles.container}>
      <MapView
        ref={mapRef} // Adicionando o ref ao MapView
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
      </MapView>

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
