import React, { useState, useCallback, useRef } from "react";
import { 
  View, 
  Button, 
  Alert, 
  StyleSheet, 
  TextInput, 
  Text 
} from "react-native";
import MapView, { Marker, Polygon } from "react-native-maps";
import { useFocusEffect } from "@react-navigation/native";

import { getAuth, signOut } from "firebase/auth";
import { db } from "../firebase"; // Sua config Firebase
import { getPropertyCoordinates } from "../utils/getPropertyCoordinates"; // Função auxiliar
import { 
  collection, 
  addDoc, 
  getDocs, 
  query, 
  where 
} from "firebase/firestore";

const TesteScreen = () => {
  const auth = getAuth();
  const mapRef = useRef(null);

  const [user, setUser] = useState(null);
  const [region, setRegion] = useState({
    latitude: -24.563907,
    longitude: -54.0645,
    latitudeDelta: 0.0922,
    longitudeDelta: 0.0421,
  });

  // Estados para desenho
  const [isDrawing, setIsDrawing] = useState(false);
  const [points, setPoints] = useState([]);

  // Estados para finalização e descrição
  const [isFinalizing, setIsFinalizing] = useState(false);
  const [description, setDescription] = useState("");

  /**
   * Busca dados do usuário e, caso haja coordenadas salvas, 
   * centraliza o mapa na propriedade correspondente
   */
  const fetchUserData = useCallback(async () => {
    try {
      const currentUser = auth.currentUser;
      if (currentUser) {
        setUser(currentUser);

        // Exemplo: recupera coordenadas salvas para a propriedade
        const coordenadas = await getPropertyCoordinates(currentUser.uid);
        if (coordenadas) {
          const { latitude, longitude } = coordenadas;
          setRegion((prevRegion) => ({
            ...prevRegion,
            latitude,
            longitude,
          }));
        } else {
          console.log("Usuário não possui propriedades ou coordenadas salvas.");
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

  /**
   * Evento ao clicar no mapa: só adiciona ponto se estiver desenhando
   */
  const handleMapPress = (e) => {
    if (isDrawing) {
      const { latitude, longitude } = e.nativeEvent.coordinate;
      setPoints((prevPoints) => [...prevPoints, { latitude, longitude }]);
    }
  };

  /**
   * Desfazer último ponto (se existir)
   */
  const handleUndoLastPoint = () => {
    if (points.length > 0) {
      setPoints((prevPoints) => prevPoints.slice(0, -1));
    }
  };

  /**
   * Iniciar ou interromper o modo de desenho
   */
  const toggleDrawing = () => {
    // Se já estiver desenhando e tiver pontos, perguntar se quer realmente cancelar
    if (isDrawing && points.length > 0) {
      Alert.alert(
        "Cancelar Desenho",
        "Você deseja realmente cancelar o desenho atual?",
        [
          {
            text: "Sim",
            onPress: () => {
              setIsDrawing(false);
              setPoints([]);
            },
          },
          {
            text: "Não",
          },
        ]
      );
    } else {
      // Se não estiver desenhando, começar o desenho
      setIsDrawing(!isDrawing);
      setPoints([]);
    }
  };

  /**
   * Finalizar desenho (ao clicar em algum botão),
   * aqui apenas abrimos a tela/prompt para descrição
   */
  const handleFinalizeDrawing = () => {
    if (points.length < 3) {
      Alert.alert("Erro", "O polígono precisa ter pelo menos 3 pontos!");
      return;
    }
    setIsFinalizing(true);
  };

  /**
   * Salvar desenho no Firestore
   */
  const handleSaveDrawing = async () => {
    if (!description.trim()) {
      Alert.alert("Erro", "É necessário inserir uma descrição!");
      return;
    }

    try {
      // Buscar a propriedade do usuário no Firestore
      const propriedadesRef = collection(db, "Propriedades");
      const q = query(propriedadesRef, where("id", "==", user.uid));
      const propriedadeSnapshot = await getDocs(q);

      if (!propriedadeSnapshot.empty) {
        // id do doc da propriedade
        const propriedadeDocId = propriedadeSnapshot.docs[0].id;
        // Subcoleção Mapas
        const mapasRef = collection(db, `Propriedades/${propriedadeDocId}/Mapas`);

        // Montar o objeto no formato GeoJSON
        // Note que GeoJSON usa [longitude, latitude]
        const geoJSON = {
          type: "Feature",
          properties: {
            descricao: description.trim(),
            dataCriacao: new Date().toISOString(),
            userId: user.uid,
          },
          geometry: {
            type: "Polygon",
            coordinates: [
              points.map((p) => [p.longitude, p.latitude]),
            ],
          },
        };

        // Adiciona o objeto no Firestore
        await addDoc(mapasRef, geoJSON);

        Alert.alert("Sucesso", "Desenho salvo com sucesso!");
        // Limpar estados
        setPoints([]);
        setDescription("");
        setIsDrawing(false);
        setIsFinalizing(false);
      } else {
        Alert.alert("Erro", "Nenhuma propriedade encontrada para este usuário.");
      }
    } catch (error) {
      console.error("Erro ao salvar desenho:", error);
      Alert.alert("Erro", "Erro ao salvar desenho: " + error.message);
    }
  };

  /**
   * Fazer logout do Firebase
   */
  const handleLogout = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      Alert.alert("Erro", error.message);
    }
  };

  /**
   * Fechamos o polígono visualmente repetindo o primeiro ponto no final
   * para renderizar no mapa (apenas visual, não altera o array original).
   */
  const closedPoints = points.length > 2 ? [...points, points[0]] : points;

  return (
    <View style={styles.container}>
      <MapView
        ref={mapRef}
        style={styles.map}
        region={region}
        onPress={handleMapPress}
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
            key={index}
            coordinate={point}
            pinColor="blue"
            title={`Ponto ${index + 1}`}
          />
        ))}
      </MapView>

      {/* Botões de controle do desenho */}
      <View style={styles.controlsContainer}>
        <Button
          title={isDrawing ? "Cancelar Desenho" : "Iniciar Desenho"}
          onPress={toggleDrawing}
        />

        {/* Só exibe o botão de desfazer se estivermos desenhando e tivermos pontos */}
        {isDrawing && points.length > 0 && (
          <Button title="Desfazer Último Ponto" onPress={handleUndoLastPoint} />
        )}

        {/* Finalizar desenho (exige ao menos 3 pontos) */}
        {isDrawing && points.length >= 3 && (
          <Button
            title="Finalizar Desenho"
            onPress={handleFinalizeDrawing}
          />
        )}

        {/* Modal ou input simples para descrição */}
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
    </View>
  );
};

export default TesteScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  map: {
    width: "100%",
    height: "70%",
  },
  controlsContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "flex-start",
    marginTop: 10,
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
