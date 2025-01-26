import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth"; // Para autenticação
import { getFirestore } from "firebase/firestore"; // Para Firestore
import { getStorage } from "firebase/storage"; // Para Storage

// Configuração do Firebase
const firebaseConfig = {
  apiKey: "AIzaSyBiCpD_0_9j54TBhBxZ_KqmjMqNarHMSyc",
  authDomain: "orion-geo-hml.firebaseapp.com",
  projectId: "orion-geo-hml",
  storageBucket: "orion-geo-hml.appspot.com",
  messagingSenderId: "926755195982",
  appId: "1:926755195982:web:040b5ce826935912e1871f",
  measurementId: "G-CS2XY03PX4"
};

// Inicializa o Firebase
const app = initializeApp(firebaseConfig);

// Inicializa os serviços que você deseja usar
const auth = getAuth(app); // Autenticação
const db = getFirestore(app); // Firestore
const storage = getStorage(app); // Storage

// Exporte os serviços para uso em outros arquivos
export { app, auth, db, storage };
