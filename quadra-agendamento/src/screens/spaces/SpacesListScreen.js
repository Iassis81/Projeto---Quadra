// src/screens/spaces/SpacesListScreen.js
// [Integrante 2 - Espaços/Quadras]
//
// PONTO DE CONEXÃO IMPORTANTE:
// Quando o usuário toca em um espaço, navegamos para a tela de agendamento
// (do Integrante 3) passando o "espaco" escolhido como parâmetro de navegação.
// É assim que a Parte 2 "entrega" o trabalho para a Parte 3.

import React, { useState, useCallback } from 'react';
import { View, TextInput, FlatList, StyleSheet, Text, TouchableOpacity } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { listarEspacos } from '../../services/spacesService';
import SpaceCard from '../../components/SpaceCard';

export default function SpacesListScreen({ navigation }) {
  const [espacos, setEspacos] = useState([]);
  const [busca, setBusca] = useState('');
  const [carregando, setCarregando] = useState(true);

  const carregarEspacos = useCallback(async (termo = '') => {
    setCarregando(true);
    const lista = await listarEspacos({ termoBusca: termo });
    setEspacos(lista);
    setCarregando(false);
  }, []);

  // useFocusEffect (em vez de useEffect simples) recarrega a lista toda vez
  // que essa tela volta a ficar visível — por exemplo, quando você volta
  // da tela "Cadastrar novo espaço" depois de salvar.
  useFocusEffect(
    useCallback(() => {
      carregarEspacos();
    }, [carregarEspacos])
  );

  function handleBuscar(texto) {
    setBusca(texto);
    carregarEspacos(texto);
  }

  return (
    <View style={styles.container}>
      <TextInput
        style={styles.busca}
        placeholder="Buscar por nome..."
        value={busca}
        onChangeText={handleBuscar}
      />

      {/* 👇 A "porta de entrada" que faltava para a tela SpaceFormScreen.
          Sem esse botão, a rota "NovoEspaco" existia no App.js mas
          ninguém conseguia navegar até ela. */}
      <TouchableOpacity
        style={styles.botaoNovo}
        onPress={() => navigation.navigate('NovoEspaco')}
      >
        <Text style={styles.botaoNovoTexto}>+ Cadastrar novo espaço</Text>
      </TouchableOpacity>

      {carregando ? (
        <Text style={styles.vazio}>Carregando...</Text>
      ) : (
        <FlatList
          data={espacos}
          keyExtractor={(item) => item.id}
          ListEmptyComponent={<Text style={styles.vazio}>Nenhum espaço encontrado.</Text>}
          renderItem={({ item }) => (
            <SpaceCard
              espaco={item}
              // 👇 Aqui entregamos o espaço escolhido para a tela do Integrante 3
              onPress={() => navigation.navigate('Agendamento', { espaco: item })}
            />
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  busca: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
  },
  vazio: { textAlign: 'center', color: '#999', marginTop: 32 },
  botaoNovo: {
    backgroundColor: '#2563eb',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 16,
  },
  botaoNovoTexto: { color: '#fff', fontWeight: 'bold' },
});
