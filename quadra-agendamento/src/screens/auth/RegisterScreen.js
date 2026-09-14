// src/screens/auth/RegisterScreen.js
// [Integrante 1 - Autenticação]
//
// Mesmo padrão da LoginScreen, mas chamando "cadastrar" em vez de "entrar".

import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { cadastrar } from '../../services/authService';

export default function RegisterScreen({ navigation }) {
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [telefone, setTelefone] = useState('');
  const [senha, setSenha] = useState('');
  const [carregando, setCarregando] = useState(false);

  async function handleCadastro() {
    if (!nome || !email || !senha) {
      Alert.alert('Atenção', 'Preencha nome, e-mail e senha.');
      return;
    }
    setCarregando(true);
    try {
      await cadastrar({ nome, email, telefone, senha });
      // Assim como no login, o AuthContext detecta o novo usuário
      // automaticamente e o App.js troca de tela sozinho.
    } catch (erro) {
      Alert.alert('Erro ao cadastrar', erro.message);
    } finally {
      setCarregando(false);
    }
  }

  return (
    <View style={styles.container}>
      <Text style={styles.titulo}>Criar conta</Text>

      <TextInput style={styles.input} placeholder="Nome" value={nome} onChangeText={setNome} />
      <TextInput
        style={styles.input}
        placeholder="E-mail"
        autoCapitalize="none"
        keyboardType="email-address"
        value={email}
        onChangeText={setEmail}
      />
      <TextInput
        style={styles.input}
        placeholder="Telefone"
        keyboardType="phone-pad"
        value={telefone}
        onChangeText={setTelefone}
      />
      <TextInput
        style={styles.input}
        placeholder="Senha"
        secureTextEntry
        value={senha}
        onChangeText={setSenha}
      />

      <TouchableOpacity style={styles.botao} onPress={handleCadastro} disabled={carregando}>
        <Text style={styles.botaoTexto}>{carregando ? 'Criando...' : 'Criar conta'}</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={() => navigation.navigate('Login')}>
        <Text style={styles.link}>Já tem conta? Entrar</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', padding: 24 },
  titulo: { fontSize: 28, fontWeight: 'bold', marginBottom: 24 },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
  },
  botao: { backgroundColor: '#2563eb', padding: 14, borderRadius: 8, alignItems: 'center' },
  botaoTexto: { color: '#fff', fontWeight: 'bold' },
  link: { color: '#2563eb', textAlign: 'center', marginTop: 16 },
});
