// src/screens/spaces/SpaceFormScreen.js
// [Integrante 2 - Espaços/Quadras]
//
// Tela simples para cadastrar um novo espaço (quadra ou sala).
// Em um app real, essa tela normalmente ficaria restrita a um "admin",
// mas para fins de aprendizado deixamos acessível a qualquer usuário logado.

import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { criarEspaco } from '../../services/spacesService';

export default function SpaceFormScreen({ navigation }) {
  const [nome, setNome] = useState('');
  const [foto, setFoto] = useState('');
  const [tipo, setTipo] = useState('');
  const [precoHora, setPrecoHora] = useState('');

  async function handleSalvar() {
    if (!nome || !tipo || !precoHora) {
      Alert.alert('Atenção', 'Preencha nome, tipo e preço por hora.');
      return;
    }
    try {
      await criarEspaco({
        nome,
        foto,
        tipo,
        precoHora: Number(precoHora),
      });
      Alert.alert('Pronto', 'Espaço cadastrado!');
      navigation.goBack();
    } catch (erro) {
      Alert.alert('Erro', 'Não foi possível cadastrar o espaço.');
    }
  }

  return (
    <View style={styles.container}>
      <Text style={styles.titulo}>Novo espaço</Text>

      <TextInput style={styles.input} placeholder="Nome (ex: Quadra 1)" value={nome} onChangeText={setNome} />
      <TextInput style={styles.input} placeholder="URL da foto" value={foto} onChangeText={setFoto} />
      <TextInput
        style={styles.input}
        placeholder="Tipo (ex: Society, Sala de reunião)"
        value={tipo}
        onChangeText={setTipo}
      />
      <TextInput
        style={styles.input}
        placeholder="Preço por hora (ex: 80)"
        keyboardType="numeric"
        value={precoHora}
        onChangeText={setPrecoHora}
      />

      <TouchableOpacity style={styles.botao} onPress={handleSalvar}>
        <Text style={styles.botaoTexto}>Cadastrar</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 24 },
  titulo: { fontSize: 24, fontWeight: 'bold', marginBottom: 24 },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
  },
  botao: { backgroundColor: '#2563eb', padding: 14, borderRadius: 8, alignItems: 'center' },
  botaoTexto: { color: '#fff', fontWeight: 'bold' },
});
