// firebaseConfig.js
//
// Este é o arquivo mais importante do projeto em termos de "conexão":
// é aqui que o app se liga ao Firebase (autenticação + banco de dados).
// TODOS os integrantes vão importar "auth" e "db" deste arquivo.

import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

// 👉 PASSO A PASSO:
// 1. Vá em https://console.firebase.google.com
// 2. Crie um projeto novo (ou use um existente)
// 3. Em "Configurações do projeto" > "Geral", clique em "Adicionar app" > Web (</>)
// 4. Copie os valores gerados e cole abaixo, substituindo os textos de exemplo.
const firebaseConfig = {
  apiKey: 'SUA_API_KEY',
  authDomain: 'SEU_PROJETO.firebaseapp.com',
  projectId: 'SEU_PROJETO',
  storageBucket: 'SEU_PROJETO.appspot.com',
  messagingSenderId: 'SEU_SENDER_ID',
  appId: 'SEU_APP_ID',
};

const app = initializeApp(firebaseConfig);

// "auth" cuida de login, cadastro e "quem está logado agora".
// Usado principalmente pelo Integrante 1.
export const auth = getAuth(app);

// "db" é a referência do banco de dados (Firestore).
// Usado pelos 3 integrantes, cada um mexendo em uma "coleção" diferente:
// - users        -> Integrante 1
// - spaces       -> Integrante 2
// - reservations -> Integrante 3
export const db = getFirestore(app);
