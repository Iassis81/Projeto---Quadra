// src/screens/booking/MyBookingsScreen.js
// [Integrante 3 - Agendamento]
//
// Lista as reservas do usuário logado. De novo, usamos useAuth() (Integrante 1)
// para saber QUEM está logado, e bookingService (Integrante 3) para buscar os dados.

import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, FlatList, StyleSheet } from 'react-native';
import { useAuth } from '../../context/AuthContext';
import { listarReservasDoUsuario } from '../../services/bookingService';

const CORES_STATUS = {
  Pendente: '#f59e0b',
  Confirmada: '#16a34a',
  Cancelada: '#dc2626',
};

export default function MyBookingsScreen() {
  const { usuario } = useAuth();
  const [reservas, setReservas] = useState([]);

  const carregar = useCallback(async () => {
    if (usuario) {
      const lista = await listarReservasDoUsuario(usuario.uid);
      setReservas(lista);
    }
  }, [usuario]);

  useEffect(() => {
    carregar();
  }, [carregar]);

  return (
    <View style={styles.container}>
      <Text style={styles.titulo}>Minhas reservas</Text>
      <FlatList
        data={reservas}
        keyExtractor={(item) => item.id}
        ListEmptyComponent={<Text style={styles.vazio}>Você ainda não tem reservas.</Text>}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <Text style={styles.data}>{item.data} · {item.horaInicio} às {item.horaFim}</Text>
            <Text style={[styles.status, { color: CORES_STATUS[item.status] }]}>
              {item.status}
            </Text>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  titulo: { fontSize: 22, fontWeight: 'bold', marginBottom: 16 },
  vazio: { textAlign: 'center', color: '#999', marginTop: 32 },
  card: {
    backgroundColor: '#fff',
    padding: 14,
    borderRadius: 8,
    marginBottom: 10,
    elevation: 1,
  },
  data: { fontSize: 15 },
  status: { fontWeight: 'bold', marginTop: 4 },
});
