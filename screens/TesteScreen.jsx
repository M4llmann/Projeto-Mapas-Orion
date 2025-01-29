import React, { useState, useCallback, useRef } from "react";
import {
  View,
  Button,
  Alert,
  StyleSheet,
  TextInput,
  Text,
  FlatList,
  TouchableOpacity,
} from "react-native";
import MapView, { Marker, Polygon } from "react-native-maps";
import { useFocusEffect } from "@react-navigation/native";
import { getAuth, signOut } from "firebase/auth";
import { db } from "../firebase";
import { collection, addDoc, getDocs, query, where } from "firebase/firestore";

const TesteScreen = () => {
  const auth = getAuth();
  const mapRef = useRef(null);

  const [user, setUser] = useState(null);
  const [properties, setProperties] = useState([]);
  const [selectedProperty, setSelectedProperty] = useState(null);
  const [region, setRegion] = useState({
    latitude: -24.563907,
    longitude: -54.0645,
    latitudeDelta: 0.0922,
    longitudeDelta: 0.0421,
  });

  const [isDrawing, setIsDrawing] = useState(false);
  const [points, setPoints] = useState([]);
  const [isFinalizing, setIsFinalizing] = useState(false);
  const [description, setDescription] = useState("");
  const [isDropdownVisible, setIsDropdownVisible] = useState(false);

  const fetchUserData = useCallback(async () => {
    try {
      const currentUser = auth.currentUser;
      if (currentUser) {
        setUser(currentUser);

        const propriedadesRef = collection(db, "Propriedades");
        const q = query(propriedadesRef, where("id", "==", currentUser.uid));
        const propriedadeSnapshot = await getDocs(q);

        if (!propriedadeSnapshot.empty) {
          const propriedades = propriedadeSnapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          }));
          setProperties(propriedades);
        } else {
          console.log("Nenhuma propriedade encontrada para este usuário.");
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

  const handleSelectProperty = (property) => {
    setSelectedProperty(property);
    setRegion({
      latitude: property.coordenadas.latitude,
      longitude: property.coordenadas.longitude,
      latitudeDelta: 0.01,
      longitudeDelta: 0.01,
    });
    setPoints([]); // Reseta os pontos ao selecionar uma nova propriedade
    setDescription(""); // Reseta a descrição
    setIsDrawing(false); // Desativa o desenho
    setIsFinalizing(false); // Desativa a finalização
  };

  const handleMapPress = (e) => {
    if (isDrawing) {
      const { latitude, longitude } = e.nativeEvent.coordinate;
      setPoints((prevPoints) => [...prevPoints, { latitude, longitude }]);
    }
  };

  const handleUndoLastPoint = () => {
    if (points.length > 0) {
      setPoints((prevPoints) => prevPoints.slice(0, -1));
    }
  };

  const toggleDrawing = () => {
    if (isDrawing && points.length > 0) {
      Alert.alert(
        "Cancelar Desenho",
        "Você deseja realmente cancelar o desenho atual?",
        [
          {
            text: "Sim",
            onPress: () => {
              setIsDrawing(false);
              setPoints([]); // Limpa os pontos ao cancelar
            },
          },
          {
            text: "Não",
          },
        ]
      );
    } else {
      setIsDrawing(!isDrawing);
      setPoints([]); // Reseta os pontos ao iniciar novo desenho
    }
  };

  const handleFinalizeDrawing = () => {
    if (points.length < 3) {
      Alert.alert("Erro", "O polígono precisa ter pelo menos 3 pontos!");
      return;
    }
    setIsFinalizing(true);
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
          descricao: description.trim(),
          pontos: points,
          dataCriacao: new Date().toISOString(),
          userId: user.uid,
        });

        Alert.alert("Sucesso", "Desenho salvo com sucesso!");

        setPoints([]); // Limpa os pontos após salvar
        setDescription(""); // Limpa a descrição
        setIsDrawing(false); // Desativa o modo de desenho
        setIsFinalizing(false); // Desativa a finalização
      } else {
        Alert.alert(
          "Erro",
          "Nenhuma propriedade encontrada para este usuário."
        );
      }
    } catch (error) {
      console.error("Erro ao salvar desenho:", error);
      Alert.alert("Erro", "Erro ao salvar desenho: " + error.message);
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      Alert.alert("Erro", error.message);
    }
  };

  const closedPoints = points.length > 2 ? [...points, points[0]] : points;

  return (
    <View style={styles.container}>
      <FlatList
        data={properties}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <TouchableOpacity onPress={() => handleSelectProperty(item)}>
            <Text style={styles.propertyItem}>
              {item.nome} ({item.coordenadas.latitude.toFixed(4)},{" "}
              {item.coordenadas.longitude.toFixed(4)})
            </Text>
          </TouchableOpacity>
        )}
        horizontal
        style={styles.propertyList}
      />

      <MapView
        ref={mapRef}
        style={styles.map}
        region={region}
        onPress={handleMapPress}
        onRegionChangeComplete={(region) => setRegion(region)}
      >
        {closedPoints.length >= 2 && (
          <Polygon
            coordinates={closedPoints}
            fillColor="rgba(0, 100, 250, 0.2)"
            strokeColor="#0064FA"
            strokeWidth={2}
          />
        )}
        {points.map((point, index) => (
          <Marker
            key={`${point.latitude}-${point.longitude}`}
            coordinate={point}
            pinColor="blue"
            title={`Ponto ${index + 1}`}
          />
        ))}
      </MapView>

      <TouchableOpacity
        style={styles.menuButton}
        onPress={() => setIsDropdownVisible(!isDropdownVisible)}
      >
        <Text style={styles.menuButtonText}>☰</Text>
      </TouchableOpacity>

      {isDropdownVisible && (
        <View style={styles.dropdownMenu}>
          <Button
            title={isDrawing ? "Cancelar Desenho" : "Iniciar Desenho"}
            onPress={toggleDrawing}
          />
          {isDrawing && points.length > 0 && (
            <Button
              title="Desfazer Último Ponto"
              onPress={handleUndoLastPoint}
            />
          )}
          {isDrawing && points.length >= 3 && (
            <Button title="Finalizar Desenho" onPress={handleFinalizeDrawing} />
          )}
          {isFinalizing && (
            <View style={{ marginTop: 10 }}>
              <Text>Descrição do Desenho:</Text>
              <TextInput
                style={styles.input}
                placeholder="Digite a descrição..."
                value={description}
                onChangeText={setDescription}
              />
              <Button title="Salvar" onPress={handleSaveDrawing} />
              <Button
                title="Cancelar"
                onPress={() => {
                  setIsFinalizing(false);
                  setDescription("");
                }}
              />
            </View>
          )}
          <Button title="Logout" onPress={handleLogout} />
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  map: {
    width: "100%",
    height: "80%",
  },
  propertyList: {
    height: 50,
    backgroundColor: "#f7f7f7",
    padding: 5,
  },
  propertyItem: {
    padding: 10,
    backgroundColor: "#fff",
    borderRadius: 4,
    margin: 5,
    textAlign: "center",
  },
  menuButton: {
    position: "absolute",
    top: 20,
    right: 20,
    backgroundColor: "#3498db",
    padding: 10,
    borderRadius: 30,
  },
  menuButtonText: {
    color: "#fff",
    fontSize: 20,
  },
  dropdownMenu: {
    position: "absolute",
    top: 70,
    right: 20,
    backgroundColor: "#fff",
    padding: 10,
    borderRadius: 5,
    elevation: 5,
    width: 200,
  },
  input: {
    width: 250,
    borderWidth: 1,
    borderColor: "#ddd",
    padding: 8,
    borderRadius: 4,
    marginVertical: 5,
  },
});

export default TesteScreen;
