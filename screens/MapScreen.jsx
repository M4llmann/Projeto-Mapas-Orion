import React, { useEffect, useState, useRef } from "react";
import {
  View,
  Alert,
  StyleSheet,
  TouchableOpacity,
  Text,
  TextInput,
  Button,
} from "react-native";
import { getAuth, onAuthStateChanged, signOut } from "firebase/auth";
import { useNavigation } from "@react-navigation/native";
import MapView, { Marker } from "react-native-maps";
import { db } from "../firebase";
import { collection, addDoc, updateDoc, getDoc, doc } from "firebase/firestore";
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
  const [propertyName, setPropertyName] = useState(""); // Nome da propriedade
  const [loading, setLoading] = useState(false); // Flag para indicar operação em andamento
  const [user, setUser] = useState(null); // Estado para armazenar o usuário logado

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setUser(user);
        try {
          // Aguarda a obtenção das coordenadas
          const coordenadas = await getPropertyCoordinates(user.uid);
          if (coordenadas) {
            const { latitude, longitude } = coordenadas;
            const newRegion = {
              latitude,
              longitude,
              latitudeDelta: 0.01,
              longitudeDelta: 0.01,
            };

            setRegion(newRegion); // Atualiza a região após receber as coordenadas

            if (mapRef.current) {
              mapRef.current.animateToRegion(newRegion, 2000); // Animação de 2 segundos
            }

            setSelectedCoordinate({ latitude, longitude });
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
  }, [auth]);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      setRegion(null); // Limpa a região do mapa
      setSelectedCoordinate(null); // Remove o marcador
    } catch (error) {
      Alert.alert("Erro", error.message);
    }
  };

  const handleMapPress = (e) => {
    const { latitude, longitude } = e.nativeEvent.coordinate;
    setSelectedCoordinate({
      latitude,
      longitude,
    });

    const newRegion = {
      latitude,
      longitude,
      latitudeDelta: 0.01,
      longitudeDelta: 0.01,
    };

    setRegion(newRegion);
  };

  const handleSaveProperty = async () => {
    if (!propertyName.trim()) {
      Alert.alert("Erro", "Por favor, insira o nome da propriedade.");
      return;
    }
    if (!selectedCoordinate) {
      Alert.alert("Erro", "Por favor, selecione uma coordenada no mapa.");
      return;
    }

    try {
      setLoading(true);

      const novaPropriedadeRef = await addDoc(collection(db, "Propriedades"), {
        nome: propertyName.trim(),
        coordenadas: selectedCoordinate,
        id: user.uid,
        dataCriacao: new Date(),
      });

      const clienteDoc = await getDoc(doc(db, "Clientes", user.uid));
      const clienteData = clienteDoc.data();
      const propriedadesRefs = clienteData.Propriedades || [];
      await updateDoc(clienteDoc.ref, {
        Propriedades: [...propriedadesRefs, novaPropriedadeRef], // Adicionando nova propriedade
      });

      Alert.alert("Sucesso", "Propriedade cadastrada com sucesso!");
      setPropertyName("");
      setSelectedCoordinate(null);
    } catch (error) {
      console.error("Erro ao salvar propriedade:", error);
      Alert.alert("Erro", "Erro ao salvar propriedade: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <MapView
        ref={mapRef}
        style={styles.map}
        region={region}
        onPress={handleMapPress}
        scrollEnabled={true}
        zoomEnabled={true}
        pitchEnabled={true}
        rotateEnabled={true}
        onRegionChangeComplete={(newRegion) => setRegion(newRegion)}
      >
        {selectedCoordinate && (
          <Marker
            coordinate={selectedCoordinate}
            title="Propriedade Selecionada"
            description={propertyName || "Nome da propriedade"}
          />
        )}
      </MapView>

      <View style={styles.formContainer}>
        <TextInput
          style={styles.input}
          placeholder="Nome da Propriedade"
          value={propertyName}
          onChangeText={setPropertyName}
        />
        <Button
          title={loading ? "Salvando..." : "Salvar Propriedade"}
          onPress={handleSaveProperty}
          disabled={loading}
        />
      </View>

      <TouchableOpacity onPress={handleLogout} style={styles.logoutButton}>
        <Text style={styles.buttonText}>Logout</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  map: {
    width: "100%",
    height: "70%",
    zIndex: 1,
  },
  formContainer: {
    padding: 20,
    backgroundColor: "#fff",
  },
  input: {
    borderWidth: 1,
    borderColor: "#ddd",
    padding: 10,
    borderRadius: 5,
    marginBottom: 10,
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
