// src/services/firebaseService.js
import {
  collection,
  getDocs,
  getDoc,
  doc,
  updateDoc,
  query,
  where,
} from "firebase/firestore";
import { db } from "../../firebase";

export const fetchClientData = async (user) => {
  if (!user) return [];
  const clientes = [];

  try {
    const clienteSnapshot = await getDocs(
      query(collection(db, "Clientes"), where("id", "==", user.uid))
    );

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
            mapas: [],
          };

          const mapasSnapshot = await getDocs(
            collection(db, `Propriedades/${propriedadeId}/Mapas`)
          );

          mapasSnapshot.forEach((mapaDoc) => {
            propriedadeData.mapas.push({ id: mapaDoc.id, ...mapaDoc.data() });
          });

          propriedades.push(propriedadeData);
        }
      }

      clienteData.propriedades = propriedades;
      clientes.push(clienteData);
    }
  } catch (error) {
    throw new Error("Erro ao buscar os dados: " + error.message);
  }

  return clientes;
};

export const updateClientData = async (clientId, updatedData) => {
  try {
    const clientDocRef = doc(db, "Clientes", clientId);
    await updateDoc(clientDocRef, updatedData);
  } catch (error) {
    throw new Error("Erro ao atualizar os dados: " + error.message);
  }
};

// Função para buscar as propriedades do usuário
export const fetchUserProperties = async (userId) => {
  const propertiesQuery = query(
    collection(db, "Propriedades"),
    where("userId", "==", userId)
  );
  const propertiesSnapshot = await getDocs(propertiesQuery);
  if (propertiesSnapshot.empty) return [];
  return propertiesSnapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  }));
};

// Função para adicionar uma nova propriedade
export const addProperty = async (user, propertyName, coordinate) => {
  if (!user) throw new Error("Usuário não autenticado");
  // Adiciona a propriedade na coleção "Propriedades"
  const propertyRef = await addDoc(collection(db, "Propriedades"), {
    userId: user.uid,
    nome: propertyName.trim(),
    coordenadas: coordinate,
    dataCriacao: new Date(),
    proprietario: user.displayName,
  });
  // Atualiza o documento do cliente (caso seja necessário)
  const clienteDoc = await getDoc(doc(db, "Clientes", user.uid));
  const clienteData = clienteDoc.data();
  const propriedadesRefs = clienteData?.Propriedades || [];
  await updateDoc(clienteDoc.ref, {
    Propriedades: [...propriedadesRefs, propertyRef],
  });
  return propertyRef;
};

// Função para salvar um desenho (mapa) em uma propriedade
export const saveMapDrawing = async (
  selectedPropertyId,
  user,
  mapPoints,
  mapDescription,
  mapType
) => {
  if (!selectedPropertyId) throw new Error("Propriedade não selecionada");
  const mapasRef = collection(db, `Propriedades/${selectedPropertyId}/Mapas`);
  const newMap = await addDoc(mapasRef, {
    userId: user.uid,
    pontos: mapPoints,
    descricao: mapDescription.trim(),
    dataCriacao: new Date(),
    tipo: mapType.trim(),
  });
  return newMap;
};

// Função para buscar os mapas de uma propriedade
export const fetchMaps = async (propertyId) => {
  const mapsSnapshot = await getDocs(
    collection(db, `Propriedades/${propertyId}/Mapas`)
  );
  return mapsSnapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  }));
};
