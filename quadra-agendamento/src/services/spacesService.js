// src/services/spacesService.js
// [Integrante 2 - Espaços/Quadras]
//
// Aqui ficam as funções que mexem na coleção "spaces" do Firestore.
// Repare que, assim como no authService, as telas nunca falam direto
// com o Firestore — elas chamam essas funções prontas.

import {
  collection,
  addDoc,
  getDocs,
  query,
  orderBy,
} from 'firebase/firestore';
import { db } from '../../firebaseConfig';

const spacesRef = collection(db, 'spaces');

// Cria um novo espaço (ex: usado em uma tela de "admin cadastra quadra")
export async function criarEspaco({ nome, foto, tipo, precoHora }) {
  await addDoc(spacesRef, { nome, foto, tipo, precoHora });
}

// Busca TODOS os espaços cadastrados, ordenados por nome.
// A busca/filtro (por nome ou tipo) é feita aqui mesmo, no JavaScript,
// depois de já ter a lista — não precisa de nada especial no Firestore
// para uma quantidade pequena/média de espaços.
export async function listarEspacos({ termoBusca = '', tipo = null } = {}) {
  const q = query(spacesRef, orderBy('nome'));
  const snapshot = await getDocs(q);

  let espacos = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));

  if (termoBusca) {
    const termo = termoBusca.toLowerCase();
    espacos = espacos.filter((e) => e.nome.toLowerCase().includes(termo));
  }

  if (tipo) {
    espacos = espacos.filter((e) => e.tipo === tipo);
  }

  return espacos;
}
