import React, { useState, useEffect } from "react";
import { View, Button, Alert, StyleSheet, TextInput } from "react-native";
import { getAuth, onAuthStateChanged, signOut } from "firebase/auth";
import MapView, { Marker, Polyline, Polygon } from "react-native-maps";
import { db } from "../firebase"; // Seu arquivo de configuração do Firebase
import { getPropertyCoordinates } from "../utils/getPropertyCoordinates"; // Importa a função
import { collection, getDocs, query, where, addDoc } from "firebase/firestore"; // Adicionei `addDoc`
import { useFocusEffect } from "@react-navigation/native";

const TesteScreen = () => {
  const auth = getAuth();
  const [user, setUser] = useState(null); // Estado para armazenar usuário
  const [isDrawing, setIsDrawing] = useState(false); // Flag para controle do desenho
  const [points, setPoints] = useState([]); // Array para armazenar pontos
  const [description, setDescription] = useState(""); // Descrição do desenho
  const [region, setRegion] = useState({
    latitude: -24.563907,
    longitude: -54.0645,
    latitudeDelta: 0.0922,
    longitudeDelta: 0.0421,
  }); // Estado para a região do mapa
  const [selectedCoordinate, setSelectedCoordinate] = useState(null); // Coordenada selecionada

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setUser(user);
        const coordenadas = await getPropertyCoordinates(user.uid); // Usando a função importada

        if (coordenadas) {
          const { latitude, longitude } = coordenadas;
          setRegion({
            latitude,
            longitude,
            latitudeDelta: 0.0922,
            longitudeDelta: 0.0421,
          });
          setSelectedCoordinate({ latitude, longitude });
        } else {
          console.log("Usuário não possui propriedades ou coordenadas.");
        }
      } else {
        setUser(null);
        Alert.alert("Erro", "Usuário não autenticado");
      }
    });

    return unsubscribe;
  }, []);

  const fetchUserPropriedadeId = async () => {
    try {
      const propriedadesRef = collection(db, "Propriedades");
      const q = query(propriedadesRef, where("id", "==", auth.currentUser.uid));

      const propriedadeSnapshot = await getDocs(q);
      if (!propriedadeSnapshot.empty) {
        return propriedadeSnapshot.docs[0].id; // Retorna o id da propriedade
      }
      return null; // Caso não tenha propriedades
    } catch (error) {
      console.error("Erro ao buscar ID da propriedade:", error);
      return null;
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      Alert.alert("Erro", error.message);
    }
  };

  const handleMapPress = (e) => {
    if (isDrawing) {
      const { latitude, longitude } = e.nativeEvent.coordinate;
      setPoints([...points, { latitude, longitude }]);
    }
  };

  const handleSaveDrawing = async () => {
    if (points.length < 3 || !description.trim()) {
      Alert.alert(
        "Erro",
        "Desenho precisa de pelo menos 3 pontos e uma descrição."
      );
      return;
    }

    try {
      const propriedadeId = await fetchUserPropriedadeId();
      if (!propriedadeId) return;

      const mapasRef = collection(db, `Propriedades/${propriedadeId}/Mapas`);
      await addDoc(mapasRef, {
        id: auth.currentUser.uid,
        pontos: points,
        descricao: description.trim(),
        dataCriacao: new Date(),
      });

      Alert.alert("Sucesso", "Desenho salvo com sucesso!");
      setPoints([]);
      setDescription("");
      setIsDrawing(false);
    } catch (error) {
      console.error("Erro ao salvar desenho:", error);
      Alert.alert("Erro", "Erro ao salvar desenho: " + error.message);
    }
  };

  return (
    <View style={styles.container}>
      <MapView
        style={styles.map}
        region={region} // Usando o estado para a região
        onPress={handleMapPress}
        onRegionChangeComplete={(newRegion) => setRegion(newRegion)} // Atualiza a região
      >
        {points.length > 0 && (
          <>
            <Polyline coordinates={points} strokeColor="#000" strokeWidth={3} />
            <Polygon
              coordinates={points}
              fillColor="rgba(0, 0, 0, 0.2)"
              strokeColor="#000"
              strokeWidth={2}
            />
          </>
        )}
        {points.map((point, index) => (
          <Marker key={index} coordinate={point} pinColor="blue" />
        ))}
      </MapView>

      {isDrawing ? (
        <>
          <TextInput
            style={styles.input}
            placeholder="Descrição do desenho"
            value={description}
            onChangeText={setDescription}
          />
          <Button title="Salvar Desenho" onPress={handleSaveDrawing} />
          <Button
            title="Cancelar Desenho"
            onPress={() => setIsDrawing(false)}
          />
        </>
      ) : (
        <Button title="Desenhar" onPress={() => setIsDrawing(true)} />
      )}

      <Button title="Logout" onPress={handleLogout} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "flex-start",
    alignItems: "center",
    paddingTop: 20,
  },
  map: {
    width: "100%",
    height: "75%",
  },
  input: {
    width: "80%",
    borderWidth: 1,
    borderColor: "#ddd",
    padding: 10,
    borderRadius: 5,
    marginTop: 10,
  },
});

export default TesteScreen;
