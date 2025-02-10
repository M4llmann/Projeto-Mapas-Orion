// src/screens/InfoScreen.js
import React, { useState, useEffect } from "react";
import { View, Text, FlatList, Alert, StyleSheet } from "react-native";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { useFocusEffect } from "@react-navigation/native";
import ClientItem from "../components/ClientItem";
import EditModal from "../components/EditModal";
import { fetchClientData, updateClientData } from "../services/firebaseService";

const InfoScreen = () => {
  const [data, setData] = useState([]);
  const [user, setUser] = useState(null);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [selectedClient, setSelectedClient] = useState(null);
  const [editedData, setEditedData] = useState({});

  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
    });
    return unsubscribe;
  }, []);

  useFocusEffect(
    React.useCallback(() => {
      if (user) {
        loadData();
      }
    }, [user])
  );

  const loadData = async () => {
    try {
      const clients = await fetchClientData(user);
      setData(clients);
    } catch (error) {
      Alert.alert("Erro", error.message);
    }
  };

  const openEditModal = (client) => {
    setSelectedClient(client);
    setEditedData(client);
    setEditModalVisible(true);
  };

  const handleSave = async () => {
    if (selectedClient && editedData) {
      try {
        await updateClientData(selectedClient.id, editedData);
        Alert.alert("Sucesso", "Dados atualizados com sucesso!");
        setEditModalVisible(false);
        loadData();
      } catch (error) {
        Alert.alert("Erro", error.message);
      }
    }
  };

  const handleChange = (field, value) => {
    setEditedData((prev) => ({ ...prev, [field]: value }));
  };

  if (!user) {
    return (
      <View style={styles.container}>
        <Text style={styles.error}>
          Você precisa estar logado para acessar esta tela.
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={data}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <ClientItem client={item} onEdit={openEditModal} />
        )}
        ListEmptyComponent={
          <Text style={styles.empty}>Nenhum cliente encontrado.</Text>
        }
      />
      <EditModal
        visible={editModalVisible}
        data={editedData}
        onChange={handleChange}
        onSave={handleSave}
        onCancel={() => setEditModalVisible(false)}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#F1F3F6",
  },
  title: {
    fontSize: 22,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 20,
    color: "#3D4C56",
  },
  error: {
    fontSize: 16,
    color: "red",
    textAlign: "center",
  },
  empty: {
    textAlign: "center",
    fontSize: 18,
    color: "#3D4C56",
    marginTop: 30,
  },
});

export default InfoScreen;
