// src/hooks/useProperties.js
import { useState, useCallback } from "react";
import { Alert } from "react-native";
import { getAuth } from "firebase/auth";
import {
  collection,
  query,
  where,
  getDocs,
  addDoc,
  updateDoc,
  doc,
} from "firebase/firestore";
import { db } from "../firebase";

export const useProperties = () => {
  const auth = getAuth();
  const [properties, setProperties] = useState([]);
  const [selectedProperty, setSelectedProperty] = useState(null);
  const [region, setRegion] = useState({
    latitude: -24.563907,
    longitude: -54.0645,
    latitudeDelta: 0.0922,
    longitudeDelta: 0.0421,
  });

  const fetchProperties = useCallback(async () => {
    try {
      const currentUser = auth.currentUser;
      if (!currentUser) {
        Alert.alert("Erro", "Usuário não autenticado");
        return;
      }

      const propriedadesRef = collection(db, "Propriedades");
      const q = query(propriedadesRef, where("id", "==", currentUser.uid));
      const snapshot = await getDocs(q);

      if (!snapshot.empty) {
        const propriedades = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setProperties(propriedades);
      }
    } catch (error) {
      console.error("Erro ao buscar propriedades:", error);
      Alert.alert("Erro", "Erro ao carregar propriedades");
    }
  }, [auth]);

  const handleSelectProperty = useCallback((property) => {
    setSelectedProperty(property);
    setRegion({
      latitude: property.coordenadas.latitude,
      longitude: property.coordenadas.longitude,
      latitudeDelta: 0.01,
      longitudeDelta: 0.01,
    });
  }, []);

  const handleSaveProperty = async (propertyName, coordinates) => {
    if (!propertyName.trim() || !coordinates) {
      Alert.alert("Erro", "Nome da propriedade e coordenadas são obrigatórios");
      return;
    }

    try {
      const currentUser = auth.currentUser;
      if (!currentUser) throw new Error("Usuário não autenticado");

      const novaPropriedadeRef = await addDoc(collection(db, "Propriedades"), {
        nome: propertyName.trim(),
        coordenadas: coordinates,
        id: currentUser.uid,
        dataCriacao: new Date(),
      });

      const clienteDoc = doc(db, "Clientes", currentUser.uid);
      await updateDoc(clienteDoc, {
        Propriedades: [
          ...((await getDocs(clienteDoc)).data()?.Propriedades || []),
          novaPropriedadeRef,
        ],
      });

      Alert.alert("Sucesso", "Propriedade cadastrada com sucesso!");
      await fetchProperties();
    } catch (error) {
      console.error("Erro ao salvar propriedade:", error);
      Alert.alert("Erro", "Erro ao salvar propriedade: " + error.message);
    }
  };

  return {
    properties,
    selectedProperty,
    region,
    setRegion,
    handleSelectProperty,
    handleSaveProperty,
    fetchProperties,
  };
};

// src/hooks/useMapDrawing.js
import { useState, useCallback } from "react";
import { Alert } from "react-native";
import { getAuth } from "firebase/auth";
import { collection, addDoc, getDocs, query, where } from "firebase/firestore";
import { db } from "../firebase";

export const useMapDrawing = (selectedProperty) => {
  const auth = getAuth();
  const [isDrawing, setIsDrawing] = useState(false);
  const [points, setPoints] = useState([]);
  const [description, setDescription] = useState("");
  const [isFinalizing, setIsFinalizing] = useState(false);

  const handleMapPress = useCallback(
    (e) => {
      if (isDrawing) {
        const { latitude, longitude } = e.nativeEvent.coordinate;
        setPoints((prevPoints) => [...prevPoints, { latitude, longitude }]);
      }
    },
    [isDrawing]
  );

  const toggleDrawing = useCallback(() => {
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
          { text: "Não" },
        ]
      );
    } else {
      setIsDrawing(!isDrawing);
      setPoints([]);
    }
  }, [isDrawing, points]);

  const handleUndoLastPoint = useCallback(() => {
    setPoints((prevPoints) => prevPoints.slice(0, -1));
  }, []);

  const handleFinalizeDrawing = useCallback(() => {
    if (points.length < 3) {
      Alert.alert("Erro", "O polígono precisa ter pelo menos 3 pontos!");
      return;
    }
    setIsFinalizing(true);
  }, [points]);

  const handleSaveDrawing = async () => {
    if (points.length < 3 || !description.trim()) {
      Alert.alert(
        "Erro",
        "Desenho precisa de pelo menos 3 pontos e uma descrição."
      );
      return;
    }

    try {
      const currentUser = auth.currentUser;
      if (!currentUser) throw new Error("Usuário não autenticado");

      const propriedadesRef = collection(db, "Propriedades");
      const q = query(propriedadesRef, where("id", "==", currentUser.uid));
      const snapshot = await getDocs(q);

      if (snapshot.empty) {
        throw new Error("Nenhuma propriedade encontrada");
      }

      const propriedadeId = snapshot.docs[0].id;
      const mapasRef = collection(db, `Propriedades/${propriedadeId}/Mapas`);

      await addDoc(mapasRef, {
        descricao: description.trim(),
        pontos: points,
        dataCriacao: new Date().toISOString(),
        userId: currentUser.uid,
      });

      Alert.alert("Sucesso", "Desenho salvo com sucesso!");

      setPoints([]);
      setDescription("");
      setIsDrawing(false);
      setIsFinalizing(false);
    } catch (error) {
      console.error("Erro ao salvar desenho:", error);
      Alert.alert("Erro", "Erro ao salvar desenho: " + error.message);
    }
  };

  return {
    isDrawing,
    points,
    description,
    isFinalizing,
    handleMapPress,
    toggleDrawing,
    handleUndoLastPoint,
    handleFinalizeDrawing,
    handleSaveDrawing,
    setDescription,
    setIsFinalizing,
  };
};
