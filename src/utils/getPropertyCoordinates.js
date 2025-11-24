import { collection, getDocs, getDoc } from "firebase/firestore";
import { db } from "../../firebase"; // Certifique-se de importar sua instância do Firestore corretamente

export const getPropertyCoordinates = async (user) => {
  try {
    const clienteQuery = collection(db, "Clientes");
    const clienteSnapshot = await getDocs(clienteQuery);

    const clienteDoc = clienteSnapshot.docs.find(
      (doc) => doc.data().id === user
    );

    if (clienteDoc) {
      console.log("Cliente encontrado:", clienteDoc.data()); // Logando dados do cliente
      const clienteData = clienteDoc.data();
      const propriedadesRefs = clienteData.Propriedades || [];

      if (propriedadesRefs.length > 0) {
        // Pegando a referência da primeira propriedade
        const PropriedadeRef = propriedadesRefs[0];

        console.log(PropriedadeRef);
        // Buscando o documento da propriedade
        const propriedadeSnapshot = await getDoc(PropriedadeRef);

        if (propriedadeSnapshot.exists()) {
          const propriedadeData = propriedadeSnapshot.data();
          console.log("Propriedade encontrada:", propriedadeData); // Logando os dados da propriedade

          if (propriedadeData && propriedadeData.coordenadas) {
            console.log(
              "Coordenadas da propriedade:",
              propriedadeData.coordenadas
            ); // Logando as coordenadas
            return propriedadeData.coordenadas; // Retorna as coordenadas
          } else {
            console.log("A propriedade não tem coordenadas.");
          }
        } else {
          console.log("Propriedade não encontrada.");
        }
      } else {
        console.log("O cliente não possui propriedades.");
      }
    } else {
      console.log("Cliente não encontrado.");
    }

    return null; // Retorna null se não encontrar as coordenadas
  } catch (error) {
    console.error("Erro ao buscar coordenadas da propriedade:", error);
    return null; // Retorna null em caso de erro
  }
};
