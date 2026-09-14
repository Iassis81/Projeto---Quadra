import React, { useState, useCallback } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { useAuth } from '../../context/AuthContext';
import {
  listarReservasDoUsuario,
  atualizarStatusReserva,
  cancelarReserva,
  STATUS_RESERVA,
} from '../../services/bookingService';

const CORES_STATUS = {
  Pendente: '#f59e0b',
  Confirmada: '#16a34a',
  Cancelada: '#dc2626',
};

export default function MyBookingsScreen() {
  const { usuario } = useAuth();
  const [reservas, setReservas] = useState([]);
  const [carregando, setCarregando] = useState(true);
  // Guarda o id da reserva que está sendo atualizada no momento, para
  // desabilitar só o botão dela (e não travar a tela inteira) enquanto
  // a atualização acontece no Firestore.
  const [atualizandoId, setAtualizandoId] = useState(null);

  const carregar = useCallback(async () => {
    if (!usuario) return;
    setCarregando(true);
    const lista = await listarReservasDoUsuario(usuario.uid);
    setReservas(lista);
    setCarregando(false);
  }, [usuario]);

  // useFocusEffect recarrega a lista toda vez que esta tela volta a ficar
  // visível — por exemplo, depois de criar uma nova reserva na tela de
  // Agendamento e voltar para cá pela aba.
  useFocusEffect(
    useCallback(() => {
      carregar();
    }, [carregar])
  );

  async function handleMudarStatus(reservaId, novoStatus) {
    setAtualizandoId(reservaId);
    try {
      await atualizarStatusReserva(reservaId, novoStatus);
      // Atualiza o item na lista local sem precisar buscar tudo de novo
      // no Firestore — deixa a tela mais rápida e responsiva.
      setReservas((atual) =>
        atual.map((reserva) =>
          reserva.id === reservaId ? { ...reserva, status: novoStatus } : reserva
        )
      );
    } catch (erro) {
      Alert.alert('Erro', 'Não foi possível atualizar o status da reserva.');
    } finally {
      setAtualizandoId(null);
    }
  }

  // Diferente de handleMudarStatus: aqui a reserva é EXCLUÍDA de verdade
  // do Firestore (cancelarReserva usa deleteDoc), não só marcada como
  // "Cancelada". Isso garante que o horário fique liberado imediatamente
  // para qualquer pessoa, inclusive na tela de agendamento do Integrante 3.
  async function handleCancelar(reservaId) {
    console.log('INICIANDO CANCELAMENTO:', reservaId);
  
    setAtualizandoId(reservaId);
  
    try {
      await cancelarReserva(reservaId);
  
      console.log('CANCELAMENTO NO FIREBASE DEU CERTO');
  
      setReservas((atual) =>
        atual.filter((reserva) => reserva.id !== reservaId)
      );
  
      Alert.alert('Sucesso', 'Reserva cancelada com sucesso!');
    } catch (erro) {
      console.log('ERRO AO CANCELAR:', erro);
  
      Alert.alert(
        'Erro ao cancelar',
        erro?.message || 'Não foi possível cancelar a reserva.'
      );
    } finally {
      setAtualizandoId(null);
    }
  }

  function confirmarCancelamento(reservaId) {
    Alert.alert(
      'Cancelar reserva',
      'Tem certeza que deseja cancelar esta reserva?',
      [
        {
          text: 'Não',
          style: 'cancel',
        },
        {
          text: 'Sim, cancelar',
          style: 'destructive',
          onPress: () => handleCancelar(reservaId),
        },
      ]
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.titulo}>Minhas reservas</Text>

      {carregando ? (
        <Text style={styles.vazio}>Carregando...</Text>
      ) : (
        <FlatList
          data={reservas}
          keyExtractor={(item) => item.id}
          ListEmptyComponent={<Text style={styles.vazio}>Você ainda não tem reservas.</Text>}
          renderItem={({ item }) => {
            const estaAtualizando = atualizandoId === item.id;
            return (
              <View style={styles.card}>
                <Text style={styles.data}>
                  {item.data} · {item.horaInicio} às {item.horaFim}
                </Text>
                <Text style={[styles.status, { color: CORES_STATUS[item.status] }]}>
                  {item.status}
                </Text>

                {/* Os botões de ação mudam de acordo com o status atual:
                    - Pendente: pode Confirmar ou Cancelar
                    - Confirmada: só pode Cancelar
                    - Cancelada: nenhuma ação (já é o status final) */}
                <View style={styles.acoes}>
                  {item.status === STATUS_RESERVA.PENDENTE && (
                    <TouchableOpacity
                      style={[styles.botao, styles.botaoConfirmar]}
                      disabled={estaAtualizando}
                      onPress={() => handleMudarStatus(item.id, STATUS_RESERVA.CONFIRMADA)}
                    >
                      <Text style={styles.botaoTexto}>
                        {estaAtualizando ? 'Atualizando...' : 'Confirmar'}
                      </Text>
                    </TouchableOpacity>
                  )}

                  {item.status !== STATUS_RESERVA.CANCELADA && (
                    <TouchableOpacity
                    style={[styles.botao, styles.botaoCancelar]}
                    disabled={estaAtualizando}
                    onPress={() => handleCancelar(item.id)}
                  >
                    <Text style={styles.botaoTexto}>
                      {estaAtualizando ? 'Atualizando...' : 'Cancelar'}
                    </Text>
                  </TouchableOpacity>
                  )}
                </View>
              </View>
            );
          }}
        />
      )}
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
  acoes: { flexDirection: 'row', gap: 8, marginTop: 10 },
  botao: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 6,
    alignItems: 'center',
  },
  botaoConfirmar: { backgroundColor: '#16a34a' },
  botaoCancelar: { backgroundColor: '#dc2626' },
  botaoTexto: { color: '#fff', fontWeight: 'bold', fontSize: 12 },
});
