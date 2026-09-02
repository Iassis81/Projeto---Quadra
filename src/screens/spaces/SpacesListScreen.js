// src/screens/spaces/SpacesListScreen.js
// [Integrante 2 - Espaços/Quadras]
//
// PONTO DE CONEXÃO IMPORTANTE:
// Quando o usuário toca em um espaço, navegamos para a tela de agendamento
// (do Integrante 3) passando o "espaco" escolhido como parâmetro de navegação.
// É assim que a Parte 2 "entrega" o trabalho para a Parte 3.

import React, { useEffect, useState, useCallback } from 'react';
import { View, TextInput, FlatList, StyleSheet, Text } from 'react-native';
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

  useEffect(() => {
    carregarEspacos();
  }, [carregarEspacos]);

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
});
