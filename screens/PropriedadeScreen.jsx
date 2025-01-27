import React, { useState, useEffect, useCallback } from "react";
import { View, Text, Button, Alert, StyleSheet, TextInput } from "react-native";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { useNavigation, useFocusEffect } from "@react-navigation/native";
import MapView, { Marker } from "react-native-maps";
import { db } from "../firebase";
import { collection, addDoc, updateDoc, getDoc, doc } from "firebase/firestore";

const PropriedadeScreen = () => {
  const [user, setUser] = useState(null); // Estado para armazenar o usuário logado
  const [propertyName, setPropertyName] = useState(""); // Nome da propriedade
  const [selectedCoordinate, setSelectedCoordinate] = useState(null); // Coordenada selecionada
  const [loading, setLoading] = useState(false); // Flag para indicar operação em andamento
  const [region, setRegion] = useState({
    latitude: -24.56391398306388, // Coordenada padrão
    longitude: -54.06453188603271,
    latitudeDelta: 0.001,
    longitudeDelta: 0.001,
  });

  const navigation = useNavigation();

  // Autenticação e verificação do usuário
  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setUser(user);
      } else {
        setUser(null);
        Alert.alert("Erro", "Usuário não autenticado");
      }
    });

    return unsubscribe;
  }, []);

  // Função chamada para atualizar dados quando a tela é acessada
  useFocusEffect(
    useCallback(() => {
      console.log("Tela Propriedade foi acessada.");
      // Limpa os campos ao entrar na tela
      setPropertyName("");
      setSelectedCoordinate(null);
      setRegion({
        latitude: -24.56391398306388,
        longitude: -54.06453188603271,
        latitudeDelta: 0.05,
        longitudeDelta: 0.05,
      });
    }, [])
  );

  const handleMapPress = (e) => {
    const { latitude, longitude } = e.nativeEvent.coordinate;

    console.log("Coordenada selecionada: ", { latitude, longitude });

    setSelectedCoordinate({
      latitude,
      longitude,
    });

    setRegion({
      latitude,
      longitude,
      latitudeDelta: 0.01,
      longitudeDelta: 0.01,
    });
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
        style={styles.map}
        initialRegion={region}
        onPress={handleMapPress}
        pointerEvents="auto" // Garante que o mapa aceite toques
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
          onPress={async () => {
            await handleSaveProperty();
          }}
          disabled={loading}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  map: {
    width: "100%",
    height: "70%", // Certifique-se de que o mapa ocupa espaço suficiente na tela
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
});

export default PropriedadeScreen;
