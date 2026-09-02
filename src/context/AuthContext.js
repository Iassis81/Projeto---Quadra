// src/context/AuthContext.js
// [Integrante 1 - Autenticação]
//
// O QUE É ISSO: um "Context" no React é como uma caixinha de informação que
// fica disponível para QUALQUER tela do app, sem precisar ficar passando
// essa informação de tela em tela manualmente.
//
// Aqui guardamos: "quem é o usuário logado agora?"
// Isso é usado pelo Integrante 3 na hora de criar uma reserva (precisa saber o uid).

import React, { createContext, useContext, useEffect, useState } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db } from '../../firebaseConfig';

// Cria a "caixinha" de contexto
const AuthContext = createContext(null);

// Este componente "embrulha" o app inteiro (ver App.js) e fica de olho
// se o usuário está logado ou não.
export function AuthProvider({ children }) {
  const [usuario, setUsuario] = useState(null); // dados do Firestore (nome, email, telefone)
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    // onAuthStateChanged "escuta" mudanças de login/logout automaticamente
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        // Usuário logado: busca os dados extras dele na coleção "users"
        const docRef = doc(db, 'users', firebaseUser.uid);
        const docSnap = await getDoc(docRef);
        setUsuario({
          uid: firebaseUser.uid,
          email: firebaseUser.email,
          ...(docSnap.exists() ? docSnap.data() : {}),
        });
      } else {
        setUsuario(null);
      }
      setCarregando(false);
    });

    return unsubscribe; // limpa o "escutador" quando o componente sai de tela
  }, []);

  return (
    <AuthContext.Provider value={{ usuario, carregando }}>
      {children}
    </AuthContext.Provider>
  );
}

// Hook que qualquer tela pode usar para pegar o usuário logado, assim:
//   const { usuario } = useAuth();
export function useAuth() {
  return useContext(AuthContext);
}
