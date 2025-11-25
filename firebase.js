import { getApps, initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth"; // Para autenticação
import { getFirestore } from "firebase/firestore"; // Para Firestore
import { getStorage } from "firebase/storage"; // Para Storage
import Constants from "expo-constants";

// Configuração do Firebase - Lê das variáveis de ambiente
// As credenciais devem estar no arquivo .env (não commitado no Git)
const firebaseConfig = {
  apiKey: Constants.expoConfig?.extra?.firebaseApiKey,
  authDomain: Constants.expoConfig?.extra?.firebaseAuthDomain,
  projectId: Constants.expoConfig?.extra?.firebaseProjectId,
  storageBucket: Constants.expoConfig?.extra?.firebaseStorageBucket,
  messagingSenderId: Constants.expoConfig?.extra?.firebaseMessagingSenderId,
  appId: Constants.expoConfig?.extra?.firebaseAppId,
  measurementId: Constants.expoConfig?.extra?.firebaseMeasurementId,
};

// Validação das credenciais
if (!firebaseConfig.apiKey || !firebaseConfig.projectId) {
  console.error(
    "⚠️ ERRO: Credenciais do Firebase não configuradas!\n" +
    "Por favor, crie um arquivo .env baseado no .env.example e preencha com suas credenciais do Firebase."
  );
}

// Inicializa o Firebase
const app = getApps().length ? getApps()[0] : initializeApp(firebaseConfig);

// Inicializa os serviços que você deseja usar
const auth = getAuth(app); // Autenticação
const db = getFirestore(app); // Firestore
const storage = getStorage(app); // Storage

// Exporte os serviços para uso em outros arquivos
export { app, auth, db, storage };
