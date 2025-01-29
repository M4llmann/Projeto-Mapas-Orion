import React, { useEffect, useState, useRef } from "react";
import { View, Alert, StyleSheet, TouchableOpacity, Text } from "react-native";
import { getAuth, onAuthStateChanged, signOut } from "firebase/auth";
import { useNavigation } from "@react-navigation/native";
import MapView, { Marker } from "react-native-maps"; // Alterei para MapView
import { getPropertyCoordinates } from "../utils/getPropertyCoordinates"; // Caminho do arquivo de função

const MapScreen = () => {
  const navigation = useNavigation(); // Hook para navegação
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
          // Aguarda a obtenção das coordenadas
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

            // Atualiza a região após receber as coordenadas
            setRegion(newRegion); // Não precisa de await aqui, pois o setState é síncrono

            // Anima a transição para a nova região
            if (mapRef.current) {
              mapRef.current.animateToRegion(newRegion, 2000); // Animação de 2 segundos
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
      // Aguarda a desconexão do usuário
      await signOut(auth);

      setRegion(null); // Limpa a região do mapa
      setSelectedCoordinate(null); // Remove o marcador
    } catch (error) {
      Alert.alert("Erro", error.message);
    }
  };

  // Função para navegar para a tela de propriedades
  const handleNavigateToPropriedade = () => {
    navigation.navigate("Propriedade"); // Navega para a tela 'Propriedade'
  };

  return (
    <View style={styles.container}>
      <MapView
        ref={mapRef} // Adicionando o ref ao MapView
        style={styles.map}
        region={region}
        onRegionChangeComplete={(newRegion) => setRegion(newRegion)} // Mantém o controle da região ao mover o mapa
        mapType="satellite"
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

      {/* Botão para navegar para a tela de Propriedade */}
      <TouchableOpacity
        onPress={handleNavigateToPropriedade}
        style={styles.navButton}
      >
        <Text style={styles.buttonText}>Ir para Propriedade</Text>
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
    height: "80%", // Ajuste a altura do mapa
  },
  logoutButton: {
    width: "100%",
    padding: 10,
    backgroundColor: "#007bff",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 5,
  },
  navButton: {
    width: "100%",
    padding: 10,
    backgroundColor: "#28a745", // Cor do botão verde para destacar
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 5,
    marginTop: 10, // Adicionando um espaçamento entre os botões
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
  },
});

export default MapScreen;
