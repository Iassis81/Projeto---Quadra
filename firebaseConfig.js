// firebaseConfig.js
//
// Este é o arquivo mais importante do projeto em termos de "conexão":
// é aqui que o app se liga ao Firebase (autenticação + banco de dados).
// TODOS os integrantes vão importar "auth" e "db" deste arquivo.

import { initializeApp } from 'firebase/app';
import { getAuth, signInAnonymously } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
/*
// CORREÇÃO: CHAMADA DA FUNÇÃO DE AUTENTICAÇÃO AGORA ESTÁ PRESENTE
// ************************************
/*signInAnonymously(auth).then(() => {
  console.log("SUCESSO: Usuário logado anonimamente. O Firestore deve funcionar.");
}).catch((error) => {
  // Isso deve alertar se o Firebase Auth não estiver habilitado para seu projeto.
  console.error("ERRO CRÍTICO: Não foi possível logar anonimamente. Verifique se o Firebase Auth (Login Anônimo) está habilitado.", error);
});
*/
// 👉 PASSO A PASSO:
// 1. Vá em https://console.firebase.google.com
// 2. Crie um projeto novo (ou use um existente)
// 3. Em "Configurações do projeto" > "Geral", clique em "Adicionar app" > Web (</>)
// 4. Copie os valores gerados e cole abaixo, substituindo os textos de exemplo.
const firebaseConfig = {
  apiKey: "AIzaSyDz8yT-aad6_jTu-ZCcMEhHMPcPuyBYPW4",
  authDomain: "quadra-agendamento-7ed17.firebaseapp.com",
  projectId: "quadra-agendamento-7ed17",
  storageBucket: "quadra-agendamento-7ed17.firebasestorage.app",
  messagingSenderId: "808517061526",
  appId: "1:808517061526:web:c510c3b0712b419ce72bb7"
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