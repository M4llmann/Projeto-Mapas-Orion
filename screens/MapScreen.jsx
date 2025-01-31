import React, { useEffect, useState, useRef } from "react";
import {
  View,
  Alert,
  TouchableOpacity,
  Text,
  TextInput,
  StyleSheet,
  Modal,
  ScrollView,
} from "react-native";
import { getAuth, onAuthStateChanged, signOut } from "firebase/auth";
import MapView, { Marker, Polyline, Polygon } from "react-native-maps";
import { db } from "../firebase";
import {
  collection,
  addDoc,
  getDocs,
  query,
  where,
  updateDoc,
  arrayUnion,
  doc,
  getDoc,
} from "firebase/firestore";
import { FontAwesome5 } from "@expo/vector-icons";

const MapScreen = () => {
  const auth = getAuth();
  const mapRef = useRef(null);

  // State for map and general UI
  const [region, setRegion] = useState({
    latitude: -24.563907,
    longitude: -54.0645,
    latitudeDelta: 0.05,
    longitudeDelta: 0.05,
  });
  const [user, setUser] = useState(null);
  const [showPropertyOptions, setShowPropertyOptions] = useState(false);
  const [showMapOptions, setShowMapOptions] = useState(false);

  // State for property management
  const [isAddingProperty, setIsAddingProperty] = useState(false);
  const [selectedCoordinate, setSelectedCoordinate] = useState(null);
  const [propertyName, setPropertyName] = useState("");
  const [properties, setProperties] = useState([]);
  const [selectedProperty, setSelectedProperty] = useState(null);
  const [showPropertiesList, setShowPropertiesList] = useState(false);

  // State for map drawing
  const [isDrawing, setIsDrawing] = useState(false);
  const [mapPoints, setMapPoints] = useState([]);
  const [mapType, setMapType] = useState("");
  const [mapDescription, setMapDescription] = useState("");
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

  const fetchUserProperties = async (userId) => {
    try {
      // Buscar diretamente na coleção Propriedades pelo userId
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
      Alert.alert("Erro", "Erro ao buscar propriedades: " + error.message);
    }
  };

  const handleAddProperty = async () => {
    if (!selectedCoordinate || !propertyName.trim()) {
      Alert.alert(
        "Erro",
        "Selecione um ponto no mapa e digite o nome da propriedade"
      );
      return;
    }

    try {
      // Adicionar a nova propriedade
      const propertyRef = await addDoc(collection(db, "Propriedades"), {
        userId: user.uid,
        nome: propertyName.trim(),
        coordenadas: selectedCoordinate,
        dataCriacao: new Date(),
        proprietario: user.displayName,
      });

      const clienteDoc = await getDoc(doc(db, "Clientes", user.uid));
      const clienteData = clienteDoc.data();
      const propriedadesRefs = clienteData.Propriedades || [];
      await updateDoc(clienteDoc.ref, {
        Propriedades: [...propriedadesRefs, propertyRef],
      });

      Alert.alert("Sucesso", "Propriedade cadastrada com sucesso!");
      setPropertyName("");
      setSelectedCoordinate(null);
      setIsAddingProperty(false);

      // Atualizar a lista de propriedades
      await fetchUserProperties(user.uid);
    } catch (error) {
      Alert.alert("Erro", "Erro ao cadastrar propriedade: " + error.message);
    }
  };

  const handleSelectProperty = (property) => {
    setSelectedProperty(property);
    setRegion({
      latitude: property.coordenadas.latitude,
      longitude: property.coordenadas.longitude,
      latitudeDelta: 0.01,
      longitudeDelta: 0.01,
    });
    mapRef.current?.animateToRegion(region, 1000);
    setShowPropertiesList(false);
  };

  const handleMapPress = (e) => {
    const { latitude, longitude } = e.nativeEvent.coordinate;

    if (isAddingProperty) {
      setSelectedCoordinate({ latitude, longitude });
    } else if (isDrawing) {
      setMapPoints([...mapPoints, { latitude, longitude }]);
    }
  };

  const handleSaveMap = async () => {
    if (!selectedProperty) {
      Alert.alert("Erro", "Selecione uma propriedade primeiro");
      return;
    }

    if (mapPoints.length < 3 || !mapDescription.trim()) {
      Alert.alert(
        "Erro",
        "Desenho precisa de pelo menos 3 pontos e uma descrição."
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
      setIsDrawing(false);
    } catch (error) {
      console.error("Erro ao salvar desenho:", error);
      Alert.alert("Erro", "Erro ao salvar desenho: " + error.message);
    }
  };

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
      Alert.alert("Erro", "Erro ao buscar mapas: " + error.message);
    }
  };

  const handleSelectMap = (map) => {
    setSelectedMap(map);
    const bounds = map.pontos.reduce(
      (acc, point) => ({
        minLat: Math.min(acc.minLat, point.latitude),
        maxLat: Math.max(acc.maxLat, point.latitude),
        minLng: Math.min(acc.minLng, point.longitude),
        maxLng: Math.max(acc.maxLng, point.longitude),
      }),
      {
        minLat: 90,
        maxLat: -90,
        minLng: 180,
        maxLng: -180,
      }
    );

    setRegion({
      latitude: (bounds.minLat + bounds.maxLat) / 2,
      longitude: (bounds.minLng + bounds.maxLng) / 2,
      latitudeDelta: (bounds.maxLat - bounds.minLat) * 1.5,
      longitudeDelta: (bounds.maxLng - bounds.minLng) * 1.5,
    });
    setShowMapsList(false);
  };

  return (
    <View style={styles.container}>
      <MapView
        ref={mapRef}
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

      {/* Property Options */}
      <TouchableOpacity
        style={styles.icon}
        onPress={() => setShowPropertyOptions(!showPropertyOptions)}
      >
        <FontAwesome5 name="home" size={24} color="white" />
      </TouchableOpacity>

      {showPropertyOptions && (
        <View style={styles.optionsContainer}>
          <TouchableOpacity
            style={styles.option}
            onPress={() => {
              setIsAddingProperty(true);
              setShowPropertyOptions(false);
            }}
          >
            <Text style={styles.optionText}>Cadastrar Propriedade</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.option}
            onPress={() => {
              setShowPropertiesList(true);
              setShowPropertyOptions(false);
            }}
          >
            <Text style={styles.optionText}>Selecionar Propriedade</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Map Options */}
      <TouchableOpacity
        style={[styles.icon, { top: 100 }]}
        onPress={() => setShowMapOptions(!showMapOptions)}
      >
        <FontAwesome5 name="map" size={24} color="white" />
      </TouchableOpacity>

      {showMapOptions && (
        <View style={[styles.optionsContainer, { top: 100 }]}>
          <TouchableOpacity
            style={styles.option}
            onPress={() => {
              if (!selectedProperty) {
                Alert.alert("Erro", "Selecione uma propriedade primeiro");
                return;
              }
              setIsDrawing(true);
              setShowMapOptions(false);
            }}
          >
            <Text style={styles.optionText}>Desenhar Mapa</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.option}
            onPress={() => {
              if (!selectedProperty) {
                Alert.alert("Erro", "Selecione uma propriedade primeiro");
                return;
              }
              fetchMaps(selectedProperty.id);
              setShowMapsList(true);
              setShowMapOptions(false);
            }}
          >
            <Text style={styles.optionText}>Selecionar Mapa</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Logout Button */}
      <TouchableOpacity
        style={[styles.icon, { top: 160 }]}
        onPress={() => signOut(auth)}
      >
        <FontAwesome5 name="sign-out-alt" size={24} color="white" />
      </TouchableOpacity>

      {/* Property Input */}
      {isAddingProperty && (
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            placeholder="Nome da Propriedade"
            value={propertyName}
            onChangeText={setPropertyName}
          />
          <TouchableOpacity style={styles.button} onPress={handleAddProperty}>
            <Text style={styles.buttonText}>Salvar</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.button, styles.cancelButton]}
            onPress={() => {
              setIsAddingProperty(false);
              setSelectedCoordinate(null);
              setPropertyName("");
            }}
          >
            <Text style={styles.buttonText}>Cancelar</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Map Drawing Controls */}
      {isDrawing && (
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            placeholder="Tipo do Mapa"
            value={mapType}
            onChangeText={setMapType}
          />
          <TextInput
            style={styles.input}
            placeholder="Descrição do Mapa"
            value={mapDescription}
            onChangeText={setMapDescription}
          />
          <TouchableOpacity style={styles.button} onPress={handleSaveMap}>
            <Text style={styles.buttonText}>Salvar Mapa</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.button, styles.cancelButton]}
            onPress={() => {
              setIsDrawing(false);
              setMapPoints([]);
              setMapType("");
              setMapDescription("");
            }}
          >
            <Text style={styles.buttonText}>Cancelar</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Properties List Modal */}
      <Modal
        visible={showPropertiesList}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowPropertiesList(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Suas Propriedades</Text>
            {properties.length === 0 ? (
              <Text style={styles.noDataText}>
                Nenhuma propriedade cadastrada
              </Text>
            ) : (
              <ScrollView style={styles.scrollView}>
                {properties.map((property) => (
                  <TouchableOpacity
                    key={property.id}
                    style={styles.listItem}
                    onPress={() => handleSelectProperty(property)}
                  >
                    <Text style={styles.listItemText}>{property.nome}</Text>
                    <Text style={styles.listItemCoords}>
                      Lat: {property.coordenadas.latitude.toFixed(6)}
                      {"\n"}
                      Lng: {property.coordenadas.longitude.toFixed(6)}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            )}
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setShowPropertiesList(false)}
            >
              <Text style={styles.buttonText}>Fechar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Maps List Modal */}
      <Modal
        visible={showMapsList}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowMapsList(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Mapas da Propriedade</Text>
            <ScrollView>
              {maps.map((map) => (
                <TouchableOpacity
                  key={map.id}
                  style={styles.listItem}
                  onPress={() => handleSelectMap(map)}
                >
                  <Text style={styles.listItemText}>{map.tipo}</Text>
                  <Text style={styles.listItemDescription}>
                    {map.descricao}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setShowMapsList(false)}
            >
              <Text style={styles.buttonText}>Fechar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  map: {
    ...StyleSheet.absoluteFillObject,
  },
  icon: {
    position: "absolute",
    top: 40,
    right: 20,
    backgroundColor: "rgba(0, 0, 0, 0.6)",
    padding: 10,
    borderRadius: 30,
    zIndex: 1,
  },
  optionsContainer: {
    position: "absolute",
    right: 70,
    top: 40,
    backgroundColor: "white",
    padding: 10,
    borderRadius: 5,
    elevation: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    zIndex: 1,
  },
  option: {
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  optionText: {
    fontSize: 16,
  },
  inputContainer: {
    position: "absolute",
    bottom: 20,
    left: 20,
    right: 20,
    backgroundColor: "white",
    padding: 15,
    borderRadius: 10,
    elevation: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  input: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 5,
    padding: 10,
    marginBottom: 10,
    backgroundColor: "white",
  },
  button: {
    backgroundColor: "#007AFF",
    padding: 12,
    borderRadius: 5,
    alignItems: "center",
    marginTop: 5,
  },
  cancelButton: {
    backgroundColor: "#FF3B30",
    marginTop: 10,
  },
  buttonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "500",
  },
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalContent: {
    width: "80%",
    maxHeight: "70%",
    backgroundColor: "white",
    borderRadius: 10,
    padding: 20,
    elevation: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 15,
    textAlign: "center",
  },
  listItem: {
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  listItemText: {
    fontSize: 16,
    fontWeight: "500",
  },
  listItemDescription: {
    fontSize: 14,
    color: "#666",
    marginTop: 5,
  },
  closeButton: {
    backgroundColor: "#007AFF",
    padding: 12,
    borderRadius: 5,
    alignItems: "center",
    marginTop: 15,
  },
  scrollView: {
    maxHeight: "80%",
  },
  noDataText: {
    textAlign: "center",
    fontSize: 16,
    color: "#666",
    marginVertical: 20,
  },
  listItemCoords: {
    fontSize: 12,
    color: "#666",
    marginTop: 5,
  },
});

export default MapScreen;
