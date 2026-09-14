// src/components/SpaceCard.js
// [Integrante 2 - Espaços/Quadras]
//
// Componente reutilizável: em vez de repetir esse "desenho" em várias telas,
// criamos uma vez e usamos com <SpaceCard espaco={...} onPress={...} />

import React from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native';

export default function SpaceCard({ espaco, onPress }) {
  return (
    <TouchableOpacity style={styles.card} onPress={onPress}>
      <Image
        source={{ uri: espaco.foto || 'https://via.placeholder.com/150' }}
        style={styles.imagem}
      />
      <View style={styles.info}>
        <Text style={styles.nome}>{espaco.nome}</Text>
        <Text style={styles.tipo}>{espaco.tipo}</Text>
        <Text style={styles.preco}>R$ {espaco.precoHora}/hora</Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 10,
    marginBottom: 12,
    overflow: 'hidden',
    elevation: 2,
  },
  imagem: { width: 90, height: 90 },
  info: { padding: 12, justifyContent: 'center' },
  nome: { fontWeight: 'bold', fontSize: 16 },
  tipo: { color: '#666', marginTop: 2 },
  preco: { color: '#2563eb', marginTop: 4, fontWeight: '600' },
});
