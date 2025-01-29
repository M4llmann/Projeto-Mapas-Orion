// CadastrarPropriedade.js
import { Alert } from "react-native";
import { db } from "../firebase";
import { collection, addDoc, updateDoc, getDoc, doc } from "firebase/firestore";

// Função para cadastrar a propriedade
export const cadastrarPropriedade = async (
  propertyName,
  selectedCoordinate,
  user
) => {
  if (!propertyName.trim()) {
    Alert.alert("Erro", "Por favor, insira o nome da propriedade.");
    return;
  }
  if (!selectedCoordinate) {
    Alert.alert("Erro", "Por favor, selecione uma coordenada no mapa.");
    return;
  }

  try {
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
    return true;
  } catch (error) {
    console.error("Erro ao salvar propriedade:", error);
    Alert.alert("Erro", "Erro ao salvar propriedade: " + error.message);
    return false;
  }
};
