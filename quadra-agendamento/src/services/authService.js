// src/services/authService.js
// [Integrante 1 - Autenticação]
//
// Aqui ficam as funções que "conversam" com o Firebase Authentication.
// As telas (LoginScreen, RegisterScreen) só chamam essas funções —
// elas não sabem como o Firebase funciona por dentro. Isso é bom porque,
// se um dia vocês trocarem de Firebase para outra coisa, só este arquivo muda.

import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
} from 'firebase/auth';
import { doc, setDoc, updateDoc } from 'firebase/firestore';
import { auth, db } from '../../firebaseConfig';

// Cria a conta no Firebase Auth E salva os dados extras (nome, telefone)
// na coleção "users" do Firestore.
export async function cadastrar({ nome, email, telefone, senha }) {
  const credenciais = await createUserWithEmailAndPassword(auth, email, senha);
  const uid = credenciais.user.uid;

  // O documento do usuário usa o mesmo "uid" do Auth como ID.
  // Isso facilita muito na hora de buscar depois.
  await setDoc(doc(db, 'users', uid), { nome, email, telefone });

  return uid;
}

export async function entrar({ email, senha }) {
  const credenciais = await signInWithEmailAndPassword(auth, email, senha);
  return credenciais.user.uid;
}

export async function sair() {
  await signOut(auth);
}

// Atualiza nome/telefone do usuário logado
export async function atualizarPerfil(uid, dados) {
  await updateDoc(doc(db, 'users', uid), dados);
}
