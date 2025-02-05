//npm start -- --reset-cache

// src/screens/MapScreen.js
import React, { useEffect, useState, useRef } from "react";
import {
  View,
  Alert,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Text,
  Modal,
  ScrollView,
} from "react-native";
import MapView, { Marker, Polyline, Polygon } from "react-native-maps";
import { getAuth, onAuthStateChanged, signOut } from "firebase/auth";
import {
  collection,
  addDoc,
  getDocs,
  query,
  where,
  updateDoc,
  doc,
  getDoc,
  deleteDoc,
} from "firebase/firestore";
import { FontAwesome5 } from "@expo/vector-icons";
import { db } from "../../firebase";
import MapControls from "../components/MapControls";
import PropertyOptions from "../components/PropertyOptions";
import MapOptions from "../components/MapOptions";
import ListModal from "../components/ListModal";
import PropertyForm from "../components/PropertyForm";
import MapDrawingForm from "../components/MapDrawingForm";

const MapScreen = () => {
  const auth = getAuth();
  const mapRef = useRef(null);

  // Estados do mapa e usuário
  const [region, setRegion] = useState({
    latitude: -24.56387409974605,
    longitude: -54.06450295277613,
    latitudeDelta: 50,
    longitudeDelta: 50,
  });
  const [user, setUser] = useState(null);

  // Estados para propriedades
  const [properties, setProperties] = useState([]);
  const [selectedCoordinate, setSelectedCoordinate] = useState(null);
  const [selectedProperty, setSelectedProperty] = useState(null);

  // Estados para formulários de propriedade e desenho
  const [isAddingProperty, setIsAddingProperty] = useState(false);
  const [propertyName, setPropertyName] = useState("");

  const [isDrawing, setIsDrawing] = useState(false);
  const [mapPoints, setMapPoints] = useState([]);
  const [mapType, setMapType] = useState("");
  const [mapDescription, setMapDescription] = useState("");

  // Estados para modais e menus
  const [showPropertyOptions, setShowPropertyOptions] = useState(false);
  const [showMapOptions, setShowMapOptions] = useState(false);
  const [showPropertiesList, setShowPropertiesList] = useState(false);
  const [showMapsList, setShowMapsList] = useState(false);
  const [maps, setMaps] = useState([]);
  const [selectedMap, setSelectedMap] = useState(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setUser(user);
        await fetchUserProperties(user.uid);
      } else {
        Alert.alert("Erro", "Usuário não autenticado");
      }
    });
    return unsubscribe;
  }, []);

  // Função para buscar propriedades
  const fetchUserProperties = async (userId) => {
    try {
      const propertiesQuery = query(
        collection(db, "Propriedades"),
        where("userId", "==", userId)
      );
      const propertiesSnapshot = await getDocs(propertiesQuery);
      if (!propertiesSnapshot.empty) {
        const propertiesData = propertiesSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setProperties(propertiesData);
      } else {
        setProperties([]);
      }
    } catch (error) {
      console.error("Erro ao buscar propriedades:", error);
      Alert.alert("Erro", error.message);
    }
  };

  // Handle do toque no mapa
  const handleMapPress = (e) => {
    const { latitude, longitude } = e.nativeEvent.coordinate;
    if (isAddingProperty) {
      setSelectedCoordinate({ latitude, longitude });
    } else if (isDrawing) {
      setMapPoints([...mapPoints, { latitude, longitude }]);
    }
  };

  // Função para adicionar propriedade (mesmo que antes)
  const handleAddProperty = async () => {
    if (!selectedCoordinate || !propertyName.trim()) {
      Alert.alert(
        "Erro",
        "Selecione um ponto no mapa e informe o nome da propriedade"
      );
      return;
    }
    try {
      const propertyRef = await addDoc(collection(db, "Propriedades"), {
        userId: user.uid,
        nome: propertyName.trim(),
        coordenadas: selectedCoordinate,
        dataCriacao: new Date(),
        proprietario: user.email,
        revisada: false,
      });

      // Atualiza o documento do cliente
      const clienteDoc = await getDoc(doc(db, "Clientes", user.uid));
      const clienteData = clienteDoc.data();
      const propriedadesRefs = clienteData?.Propriedades || [];
      await updateDoc(clienteDoc.ref, {
        Propriedades: [...propriedadesRefs, propertyRef],
      });

      Alert.alert("Sucesso", "Propriedade cadastrada com sucesso!");
      setPropertyName("");
      setSelectedCoordinate(null);
      setIsAddingProperty(false);
      await fetchUserProperties(user.uid);
    } catch (error) {
      Alert.alert("Erro", error.message);
    }
  };

  const handleDeleteProperty = async (propertyId) => {
    try {
      // Exibe confirmação antes de deletar
      Alert.alert(
        "Confirmar exclusão",
        "Tem certeza que deseja excluir esta propriedade?",
        [
          {
            text: "Cancelar",
            style: "cancel",
          },
          {
            text: "Sim, excluir",
            onPress: async () => {
              // Referência do documento no Firestore
              const propertyRef = doc(db, "Propriedades", propertyId);

              // Deleta a propriedade
              await deleteDoc(propertyRef);

              // Atualiza a lista local de propriedades
              setProperties((prevProperties) =>
                prevProperties.filter((prop) => prop.id !== propertyId)
              );

              // Se a propriedade deletada for a selecionada, limpa a seleção
              if (selectedProperty?.id === propertyId) {
                setSelectedProperty(null);
              }

              Alert.alert("Sucesso", "Propriedade excluída com sucesso!");
            },
            style: "destructive",
          },
        ]
      );
    } catch (error) {
      Alert.alert("Erro", "Não foi possível excluir a propriedade");
      console.error("Erro ao deletar propriedade:", error);
    }
  };

  // Seleciona a propriedade e centraliza o mapa
  const handleSelectProperty = (property) => {
    setSelectedProperty(property);
    setRegion({
      latitude: property.coordenadas.latitude,
      longitude: property.coordenadas.longitude,
      latitudeDelta: 0.01,
      longitudeDelta: 0.01,
    });
    mapRef.current?.animateToRegion(
      {
        latitude: property.coordenadas.latitude,
        longitude: property.coordenadas.longitude,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      },
      1000
    );
    setShowPropertiesList(false);
  };

  // Salva o desenho do mapa
  const handleSaveMap = async () => {
    if (!selectedProperty) {
      Alert.alert("Erro", "Selecione uma propriedade primeiro");
      return;
    }
    if (mapPoints.length < 3 || !mapDescription.trim()) {
      Alert.alert(
        "Erro",
        "O desenho precisa de pelo menos 3 pontos e uma descrição."
      );
      return;
    }
    try {
      const mapasRef = collection(
        db,
        `Propriedades/${selectedProperty.id}/Mapas`
      );
      await addDoc(mapasRef, {
        userId: user.uid,
        pontos: mapPoints,
        descricao: mapDescription.trim(),
        dataCriacao: new Date(),
        tipo: mapType.trim(),
      });
      Alert.alert("Sucesso", "Desenho salvo com sucesso!");
      setMapPoints([]);
      setMapDescription("");
      setMapType("");
      setIsDrawing(false);
    } catch (error) {
      Alert.alert("Erro", error.message);
    }
  };

  // Busca os mapas da propriedade
  const fetchMaps = async (propertyId) => {
    try {
      const mapsSnapshot = await getDocs(
        collection(db, `Propriedades/${propertyId}/Mapas`)
      );
      const mapsData = mapsSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setMaps(mapsData);
    } catch (error) {
      Alert.alert("Erro", error.message);
    }
  };

  // Função para deletar o mapa
  const handleDeleteMap = async () => {
    if (!selectedProperty) {
      Alert.alert("Erro", "Selecione uma propriedade primeiro");
      return;
    }
    if (!selectedMap) {
      Alert.alert("Erro", "Selecione um mapa para deletar");
      return;
    }
    try {
      // Cria a referência do documento do mapa na subcoleção "Mapas"
      const mapRef = doc(
        db,
        `Propriedades/${selectedProperty.id}/Mapas`,
        selectedMap.id
      );
      // Deleta o documento do mapa
      await deleteDoc(mapRef);
      Alert.alert("Sucesso", "Mapa deletado com sucesso!");

      // Atualiza os estados se necessário, por exemplo, removendo o mapa da lista:
      setMaps((prevMaps) =>
        prevMaps.filter((map) => map.id !== selectedMap.id)
      );
      // Se desejar, limpe o estado do mapa selecionado:
      setSelectedMap(null);
    } catch (error) {
      Alert.alert("Erro", error.message);
    }
  };

  // Seleciona um mapa e centraliza
  const handleSelectMap = (map) => {
    setSelectedMap(map);
    // Cálculo simples da região com base nos pontos
    const { minLat, maxLat, minLng, maxLng } = map.pontos.reduce(
      (acc, point) => ({
        minLat: Math.min(acc.minLat, point.latitude),
        maxLat: Math.max(acc.maxLat, point.latitude),
        minLng: Math.min(acc.minLng, point.longitude),
        maxLng: Math.max(acc.maxLng, point.longitude),
      }),
      { minLat: 90, maxLat: -90, minLng: 180, maxLng: -180 }
    );
    setRegion({
      latitude: (minLat + maxLat) / 2,
      longitude: (minLng + maxLng) / 2,
      latitudeDelta: (maxLat - minLat) * 1.5 || 0.05,
      longitudeDelta: (maxLng - minLng) * 1.5 || 0.05,
    });
    setShowMapsList(false);
  };

  return (
    <View style={styles.container}>
      <MapView
        ref={mapRef}
        mapType="satellite"
        style={styles.map}
        region={region}
        onPress={handleMapPress}
      >
        {selectedCoordinate && (
          <Marker
            coordinate={selectedCoordinate}
            title={propertyName || "Nova Propriedade"}
          />
        )}
        {selectedProperty && (
          <Marker
            coordinate={selectedProperty.coordenadas}
            title={selectedProperty.nome}
            pinColor="green"
          />
        )}
        {mapPoints.length > 0 && (
          <>
            <Polyline
              coordinates={mapPoints}
              strokeColor="#000"
              strokeWidth={3}
            />
            <Polygon
              coordinates={mapPoints}
              fillColor="rgba(0, 0, 0, 0.2)"
              strokeColor="#000"
              strokeWidth={2}
            />
            {mapPoints.map((point, index) => (
              <Marker key={index} coordinate={point} pinColor="blue" />
            ))}
          </>
        )}
        {selectedMap && (
          <Polygon
            coordinates={selectedMap.pontos}
            fillColor="rgba(255, 0, 0, 0.2)"
            strokeColor="#FF0000"
            strokeWidth={2}
          />
        )}
      </MapView>

      {/* Ícones de Controle */}
      <MapControls
        onPropertyPress={() => setShowPropertyOptions(!showPropertyOptions)}
        onMapPress={() => setShowMapOptions(!showMapOptions)}
        onLogoutPress={() => signOut(auth)}
      />

      {/* Menus de Opções */}
      {showPropertyOptions && (
        <PropertyOptions
          onCadastrar={() => {
            setIsAddingProperty(true);
            setShowPropertyOptions(false);
          }}
          onSelecionar={() => {
            setShowPropertiesList(true);
            setShowPropertyOptions(false);
          }}
        />
      )}
      {showMapOptions && (
        <MapOptions
          onDesenhar={() => {
            if (!selectedProperty) {
              Alert.alert("Erro", "Selecione uma propriedade primeiro");
              return;
            }
            setIsDrawing(true);
            setShowMapOptions(false);
          }}
          onSelecionar={async () => {
            if (!selectedProperty) {
              Alert.alert("Erro", "Selecione uma propriedade primeiro");
              return;
            }
            await fetchMaps(selectedProperty.id);
            setShowMapsList(true);
            setShowMapOptions(false);
          }}
        />
      )}

      {/* Formulários */}
      {isAddingProperty && (
        <PropertyForm
          propertyName={propertyName}
          onChangeName={setPropertyName}
          onSave={handleAddProperty}
          onCancel={() => {
            setIsAddingProperty(false);
            setSelectedCoordinate(null);
            setPropertyName("");
          }}
        />
      )}
      {isDrawing && (
        <MapDrawingForm
          mapType={mapType}
          mapDescription={mapDescription}
          onChangeType={setMapType}
          onChangeDescription={setMapDescription}
          onSave={handleSaveMap}
          onCancel={() => {
            setIsDrawing(false);
            setMapPoints([]);
            setMapType("");
            setMapDescription("");
          }}
        />
      )}

      {/* Modais */}
      <ListModal
        visible={showPropertiesList}
        title="Suas Propriedades"
        data={properties}
        renderItem={(property) => (
          <View key={property.id} style={styles.itemContainer}>
            <TouchableOpacity
              style={styles.itemInfo}
              onPress={() => handleSelectProperty(property)}
            >
              <Text style={styles.listItemText}>{property.nome}</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.deleteButton}
              onPress={() => handleDeleteProperty(property.id)}
            >
              <FontAwesome5 name="times" size={20} color="red" />
            </TouchableOpacity>
          </View>
        )}
        onClose={() => setShowPropertiesList(false)}
      />

      <ListModal
        visible={showMapsList}
        title="Mapas da Propriedade"
        data={maps}
        renderItem={(map) => (
          <View key={map.id} style={styles.itemContainer}>
            <TouchableOpacity
              style={styles.itemInfo}
              onPress={() => handleSelectMap(map)}
            >
              <Text style={styles.listItemText}>{map.tipo}</Text>
              <Text style={styles.listItemDescription}>{map.descricao}</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.deleteButton}
              onPress={() => {
                // Defina o mapa selecionado e chame a função de exclusão
                setSelectedMap(map);
                handleDeleteMap();
              }}
            >
              <FontAwesome5 name="times" size={20} color="red" />
            </TouchableOpacity>
          </View>
        )}
        onClose={() => setShowMapsList(false)}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  map: { ...StyleSheet.absoluteFillObject },
  listItem: { padding: 15, borderBottomWidth: 1, borderBottomColor: "#eee" },
  listItemText: { fontSize: 16, fontWeight: "500" },
  listItemDescription: { fontSize: 14, color: "#666", marginTop: 5 },
  itemContainer: {
    flexDirection: "row", // Organiza os elementos em linha
    alignItems: "center", // Alinha verticalmente os itens no centro
    justifyContent: "space-between", // Espaça os itens, colocando o primeiro à esquerda e o segundo à direita
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
});

export default MapScreen;
