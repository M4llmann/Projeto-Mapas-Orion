import React, { useState, useCallback } from "react";
import { View, Button, Alert, StyleSheet, TextInput } from "react-native";
import { getAuth, signOut } from "firebase/auth";
import MapView, { Marker, Polyline, Polygon } from "react-native-maps";
import { useFocusEffect } from "@react-navigation/native";
import { db } from "../firebase"; // Configuração do Firebase
import { getPropertyCoordinates } from "../utils/getPropertyCoordinates"; // Função auxiliar
import { collection, addDoc, getDocs, query, where } from "firebase/firestore";

const TesteScreen = () => {
  const auth = getAuth();
  const [user, setUser] = useState(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [points, setPoints] = useState([]);
  const [description, setDescription] = useState("");
  const [region, setRegion] = useState({
    latitude: -24.563907,
    longitude: -54.0645,
    latitudeDelta: 0.0922,
    longitudeDelta: 0.0421,
  });

  const fetchUserData = useCallback(async () => {
    try {
      const currentUser = auth.currentUser;
      if (currentUser) {
        setUser(currentUser);
        const coordenadas = await getPropertyCoordinates(currentUser.uid);

        if (coordenadas) {
          const { latitude, longitude } = coordenadas;
          setRegion((prevRegion) => ({
            ...prevRegion,
            latitude,
            longitude,
          }));
        } else {
          console.log("Usuário não possui propriedades ou coordenadas.");
        }
      } else {
        Alert.alert("Erro", "Usuário não autenticado");
        setUser(null);
      }
    } catch (error) {
      console.error("Erro ao buscar dados do usuário:", error);
    }
  }, [auth]);

  useFocusEffect(
    useCallback(() => {
      fetchUserData();
    }, [fetchUserData])
  );

  const handleLogout = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      Alert.alert("Erro", error.message);
    }
  };

  const handleMapPress = (e) => {
    console.log("isDrawing: ", isDrawing); // Verifique se isDrawing está true
    if (isDrawing) {
      const { latitude, longitude } = e.nativeEvent.coordinate;
      setPoints((prevPoints) => [...prevPoints, { latitude, longitude }]);
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
      const propriedadesRef = collection(db, "Propriedades");
      const q = query(propriedadesRef, where("id", "==", user.uid));

      const propriedadeSnapshot = await getDocs(q);
      if (!propriedadeSnapshot.empty) {
        const propriedadeId = propriedadeSnapshot.docs[0].id;
        const mapasRef = collection(db, `Propriedades/${propriedadeId}/Mapas`);

        await addDoc(mapasRef, {
          id: user.uid,
          pontos: points,
          descricao: description.trim(),
          dataCriacao: new Date(),
        });

        Alert.alert("Sucesso", "Desenho salvo com sucesso!");
        setPoints([]);
        setDescription("");
        setIsDrawing(false);
      }
    } catch (error) {
      console.error("Erro ao salvar desenho:", error);
      Alert.alert("Erro", "Erro ao salvar desenho: " + error.message);
    }
  };

  return (
    <View style={styles.container}>
      <MapView style={styles.map} region={region} onPress={handleMapPress}>
        {points.length > 0 && (
          <Polyline coordinates={points} strokeColor="#000" strokeWidth={3} />
        )}
        {points.length > 0 && (
          <Polygon
            coordinates={points}
            fillColor="rgba(0, 0, 0, 0.2)"
            strokeColor="#000"
            strokeWidth={2}
          />
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
            onPress={() => {
              setIsDrawing(false);
              setPoints([]);
              setDescription("");
            }}
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
    zIndex: 1,
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
