import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  FlatList,
  TextInput,
  Button,
  StyleSheet,
  TouchableOpacity,
  Modal,
  Alert,
} from "react-native";
import {
  collection,
  getDocs,
  getDoc,
  doc,
  updateDoc,
  query,
  where,
} from "firebase/firestore";
import { db } from "../firebase";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { useFocusEffect } from "@react-navigation/native";

export default function InfoScreen() {
  const [data, setData] = useState([]);
  const [user, setUser] = useState(null);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [selectedClient, setSelectedClient] = useState(null);
  const [editedData, setEditedData] = useState({});

  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setUser(user);
      } else {
        setUser(null);
      }
    });
    return unsubscribe;
  }, []);

  useFocusEffect(
    React.useCallback(() => {
      if (user) {
        fetchCollectionData(user);
      }
    }, [user])
  );

  const fetchCollectionData = async (user) => {
    if (!user) return;

    try {
      const clientes = [];
      const clienteSnapshot = await getDocs(
        query(collection(db, "Clientes"), where("id", "==", user.uid))
      );

      console.log(clienteSnapshot);

      for (const clienteDoc of clienteSnapshot.docs) {
        const clienteId = clienteDoc.id;
        const clienteData = { id: clienteId, ...clienteDoc.data() };
        const propriedadesRefs = clienteData.Propriedades || [];

        const propriedades = [];

        for (const propriedadeRef of propriedadesRefs) {
          const propriedadeDoc = await getDoc(propriedadeRef);

          if (propriedadeDoc.exists()) {
            const propriedadeId = propriedadeDoc.id;
            const propriedadeData = {
              id: propriedadeId,
              ...propriedadeDoc.data(),
            };

            // Inicializa o array de mapas
            propriedadeData.mapas = [];

            // Ajuste no caminho para buscar os mapas
            const mapasSnapshot = await getDocs(
              collection(db, `Propriedades/${propriedadeId}/Mapas`)
            );

            // Verifique se o snapshot de mapas não está vazio
            if (mapasSnapshot.empty) {
              console.log(
                `Nenhum mapa encontrado para a propriedade ${propriedadeId}`
              );
            }

            // Itera sobre os documentos de mapas encontrados
            mapasSnapshot.forEach((mapaDoc) => {
              propriedadeData.mapas.push({ id: mapaDoc.id, ...mapaDoc.data() });
            });

            // Adiciona a propriedade ao array de propriedades
            propriedades.push(propriedadeData);
          }
        }

        // Adiciona as propriedades ao cliente
        clienteData.propriedades = propriedades;

        // Adiciona o cliente à lista final
        clientes.push(clienteData);
      }

      // Atualiza o estado com os dados carregados
      setData(clientes);
      console.log(clientes);
    } catch (error) {
      console.error("Erro ao buscar os dados:", error);
      Alert.alert(
        "Erro",
        "Erro ao carregar os dados. Tente novamente mais tarde."
      );
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
        const docRef = doc(db, "Clientes", selectedClient.id);
        await updateDoc(docRef, editedData);
        Alert.alert("Sucesso", "Dados atualizados com sucesso!");
        setEditModalVisible(false);
        fetchCollectionData(user); // Passe o usuário atual para buscar os dados novamente
      } catch (error) {
        Alert.alert("Erro", "Erro ao salvar os dados: " + error.message);
      }
    }
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
      <Text style={styles.title}>Clientes</Text>
      <FlatList
        data={data}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.item}>
            <Text style={styles.field}>ID: {item.id}</Text>
            <Text style={styles.field}>Proprietário: {item.nome}</Text>
            <Text style={styles.field}>Email: {item.email}</Text>
            <Text style={styles.field}>CPF: {item.documento?.cpf}</Text>
            <Text style={styles.field}>Endereço:</Text>
            <Text style={styles.subField}>- Rua: {item.endereco?.rua}</Text>
            <Text style={styles.subField}>
              - Número: {item.endereco?.numero}
            </Text>
            <Text style={styles.subField}>
              - Cidade: {item.endereco?.cidade}
            </Text>
            <Text style={styles.subField}>
              - Estado: {item.endereco?.estado}
            </Text>
            <Text style={styles.subField}>- País: {item.endereco?.pais}</Text>

            <Text style={styles.field}>Propriedades:</Text>
            {item.propriedades.length > 0 ? (
              item.propriedades.map((propriedade) => (
                <View key={propriedade.id} style={styles.subItem}>
                  <Text style={styles.subField}>
                    - ID do proprietário: {propriedade.id}
                  </Text>
                  <Text style={styles.subField}>
                    - Nome: {propriedade.nome}
                  </Text>

                  <Text style={styles.subField}>Mapas:</Text>
                  {propriedade.mapas && propriedade.mapas.length > 0 ? (
                    propriedade.mapas.map((mapa) => (
                      <View key={mapa.id} style={styles.subItem}>
                        <Text style={styles.subField}>-- ID: {mapa.id}</Text>
                        <Text style={styles.subField}>
                          -- Descrição: {mapa.descricao}
                        </Text>
                        <Text style={styles.subField}>
                          -- Tipo: {mapa.tipo}
                        </Text>
                        <Text style={styles.subField}>-- Pontos:</Text>
                        {mapa.pontos && mapa.pontos.length > 0 ? (
                          mapa.pontos.map((ponto, index) => (
                            <Text key={index} style={styles.subField}>
                              --- {ponto.latitude.toFixed(6)}° S,{" "}
                              {ponto.longitude.toFixed(6)}° W
                            </Text>
                          ))
                        ) : (
                          <Text style={styles.subField}>
                            Nenhum ponto encontrado.
                          </Text>
                        )}
                      </View>
                    ))
                  ) : (
                    <Text style={styles.subField}>Nenhum mapa encontrado.</Text>
                  )}
                </View>
              ))
            ) : (
              <Text style={styles.subField}>Nenhuma propriedade</Text>
            )}

            <TouchableOpacity
              onPress={() => openEditModal(item)}
              style={styles.editButton}
            >
              <Text style={styles.editButtonText}>Editar</Text>
            </TouchableOpacity>
          </View>
        )}
        ListEmptyComponent={
          <Text style={styles.empty}>Nenhum cliente encontrado.</Text>
        }
      />

      <Modal visible={editModalVisible} animationType="slide" transparent>
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Atualizar Cadastro</Text>
            <TextInput
              style={styles.input}
              placeholder="Nome"
              value={editedData.nome || ""}
              onChangeText={(text) =>
                setEditedData({ ...editedData, nome: text })
              }
            />
            <TextInput
              style={styles.input}
              placeholder="Email"
              value={editedData.email || ""}
              onChangeText={(text) =>
                setEditedData({ ...editedData, email: text })
              }
            />
            <View style={styles.modalActions}>
              <Button title="Salvar" onPress={handleSave} />
              <Button
                title="Cancelar"
                onPress={() => setEditModalVisible(false)}
              />
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#f9f9f9",
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 20,
  },
  item: {
    padding: 15,
    backgroundColor: "#fff",
    borderRadius: 10,
    marginBottom: 10,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
  },
  field: {
    fontSize: 16,
    marginBottom: 5,
  },
  subField: {
    fontSize: 14,
    marginLeft: 10,
  },
  editButton: {
    marginTop: 10,
    backgroundColor: "#007bff",
    padding: 10,
    borderRadius: 5,
  },
  editButtonText: {
    color: "#fff",
    textAlign: "center",
  },
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalContent: {
    width: "80%",
    backgroundColor: "#fff",
    padding: 20,
    borderRadius: 10,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
  },
  input: {
    borderWidth: 1,
    borderColor: "#ddd",
    padding: 10,
    borderRadius: 5,
    marginBottom: 10,
  },
  modalActions: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  empty: {
    textAlign: "center",
    marginTop: 20,
  },
});
