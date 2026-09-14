// src/screens/auth/ProfileScreen.js
// [Integrante 1 - Autenticação]
//
// Repare como pegamos o usuário logado: com o hook "useAuth()".
// Isso é possível porque o App.js envolveu tudo com <AuthProvider>.

import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { useAuth } from '../../context/AuthContext';
import { atualizarPerfil, sair } from '../../services/authService';

export default function ProfileScreen() {
  const { usuario } = useAuth();
  const [nome, setNome] = useState(usuario?.nome ?? '');
  const [telefone, setTelefone] = useState(usuario?.telefone ?? '');

  async function handleSalvar() {
    try {
      await atualizarPerfil(usuario.uid, { nome, telefone });
      Alert.alert('Pronto', 'Perfil atualizado!');
    } catch (erro) {
      Alert.alert('Erro', 'Não foi possível salvar.');
    }
  }

  return (
    <View style={styles.container}>
      <Text style={styles.titulo}>Meu perfil</Text>
      <Text style={styles.label}>E-mail</Text>
      <Text style={styles.valorFixo}>{usuario?.email}</Text>

      <Text style={styles.label}>Nome</Text>
      <TextInput style={styles.input} value={nome} onChangeText={setNome} />

      <Text style={styles.label}>Telefone</Text>
      <TextInput style={styles.input} value={telefone} onChangeText={setTelefone} />

      <TouchableOpacity style={styles.botao} onPress={handleSalvar}>
        <Text style={styles.botaoTexto}>Salvar</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.botaoSair} onPress={sair}>
        <Text style={styles.botaoSairTexto}>Sair da conta</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 24 },
  titulo: { fontSize: 24, fontWeight: 'bold', marginBottom: 24 },
  label: { fontSize: 12, color: '#666', marginTop: 12 },
  valorFixo: { fontSize: 16, marginTop: 4 },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 12,
    marginTop: 4,
  },
  botao: {
    backgroundColor: '#2563eb',
    padding: 14,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 24,
  },
  botaoTexto: { color: '#fff', fontWeight: 'bold' },
  botaoSair: { padding: 14, alignItems: 'center', marginTop: 12 },
  botaoSairTexto: { color: '#dc2626' },
});
