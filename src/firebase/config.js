// ⚠️ SUBSTITUA COM SUAS CREDENCIAIS DO FIREBASE
// Acesse: https://console.firebase.google.com/
// 1. Crie um projeto
// 2. Vá em Configurações do Projeto
// 3. Role até "Seus apps" e clique em "Web"
// 4. Copie as credenciais e cole abaixo

import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: "SUA_API_KEY",
  authDomain: "SEU_PROJECT_ID.firebaseapp.com",
  projectId: "SEU_PROJECT_ID",
  storageBucket: "SEU_PROJECT_ID.appspot.com",
  messagingSenderId: "SEU_MESSAGING_SENDER_ID",
  appId: "SEU_APP_ID"
};

// Inicializa o Firebase
const app = initializeApp(firebaseConfig);

// Inicializa os serviços
export const db = getFirestore(app);
export const auth = getAuth(app);
export const storage = getStorage(app);

export default app;
