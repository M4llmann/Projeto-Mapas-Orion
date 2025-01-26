import { collection, getDocs } from "firebase/firestore";

/**
 * Verifica se um cliente tem propriedades cadastradas no Firestore.
 * @param {Object} db - Instância do Firestore.
 * @param {string} userId - ID do usuário autenticado.
 * @returns {Object|null} - Retorna a primeira propriedade com coordenadas ou null se não houver.
 */
export const getFirstProperty = async (db, userId) => {
  try {
    // Busca os clientes na coleção "Clientes"
    const clienteQuery = collection(db, "Clientes");
    const clienteSnapshot = await getDocs(clienteQuery);

    // Encontra o documento do cliente pelo ID
    const clienteDoc = clienteSnapshot.docs.find(
      (doc) => doc.data().id === userId
    );

    if (!clienteDoc) {
      console.error("Cliente não encontrado.");
      return null;
    }

    const clienteData = clienteDoc.data();

    // Verifica se o cliente tem propriedades no formato de mapa
    const propriedadesMap = clienteData.Propriedades || {};
    const propriedadeKeys = Object.keys(propriedadesMap);

    if (propriedadeKeys.length > 0) {
      // Seleciona a primeira propriedade
      const primeiraPropriedadeKey = propriedadeKeys[0];
      const primeiraPropriedade = propriedadesMap[primeiraPropriedadeKey];

      // Verifica se a propriedade tem coordenadas
      if (primeiraPropriedade.coordenadas) {
        return primeiraPropriedade;
      }
    }

    return null;
  } catch (error) {
    console.error("Erro ao buscar propriedades:", error);
    throw new Error("Erro ao buscar propriedades.");
  }
};
