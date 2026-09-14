// src/screens/booking/BookingCalendarScreen.js
// [Integrante 3 - Agendamento]
//
// Esta tela RECEBE dois dados de fora:
// - `espaco` -> veio da navegação, entregue pelo Integrante 2 (SpacesListScreen)
// - `usuario` -> vem do useAuth(), entregue pelo Integrante 1 (AuthContext)
//
// É aqui que as 3 partes do projeto se encontram de verdade.

import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert, ScrollView } from 'react-native';
import { Calendar } from 'react-native-calendars';
import { useAuth } from '../../context/AuthContext';
import { buscarReservasDoDia, criarReserva } from '../../services/bookingService';

// Lista fixa de horários possíveis, de 1 em 1 hora, das 8h às 20h.
// (Em um projeto mais avançado, isso poderia vir do próprio cadastro do espaço.)
const HORARIOS = Array.from({ length: 12 }, (_, i) => {
  const hora = 8 + i;
  return `${String(hora).padStart(2, '0')}:00`;
});

export default function BookingCalendarScreen({ route }) {
  const { espaco } = route.params; // 👈 recebido do Integrante 2
  const { usuario } = useAuth(); // 👈 recebido do Integrante 1

  const [dataSelecionada, setDataSelecionada] = useState(null);
  const [reservasDoDia, setReservasDoDia] = useState([]);
  const [horarioSelecionado, setHorarioSelecionado] = useState(null);

  const carregarReservas = useCallback(async (data) => {
    const reservas = await buscarReservasDoDia(espaco.id, data);
    setReservasDoDia(reservas);
  }, [espaco.id]);

  useEffect(() => {
    if (dataSelecionada) {
      carregarReservas(dataSelecionada);
    }
  }, [dataSelecionada, carregarReservas]);

  // Um horário está "ocupado" se já existe alguma reserva cobrindo aquele slot de 1h.
  function horarioEstaOcupado(horario) {
    const [hora] = horario.split(':').map(Number);
    const inicioSlot = hora * 60;
    const fimSlot = inicioSlot + 60;

    return reservasDoDia.some((reserva) => {
      const [hIni, mIni] = reserva.horaInicio.split(':').map(Number);
      const [hFim, mFim] = reserva.horaFim.split(':').map(Number);
      const inicioReserva = hIni * 60 + mIni;
      const fimReserva = hFim * 60 + mFim;
      return inicioSlot < fimReserva && inicioReserva < fimSlot;
    });
  }

  async function handleConfirmar() {
    if (!dataSelecionada || !horarioSelecionado) {
      Alert.alert('Atenção', 'Escolha uma data e um horário.');
      return;
    }
    if (!usuario) {
      Alert.alert('Atenção', 'Você precisa estar logado para reservar.');
      return;
    }

    const [hora] = horarioSelecionado.split(':').map(Number);
    const horaFim = `${String(hora + 1).padStart(2, '0')}:00`;

    try {
      await criarReserva({
        spaceId: espaco.id,
        userId: usuario.uid,
        data: dataSelecionada,
        horaInicio: horarioSelecionado,
        horaFim,
      });
      Alert.alert('Reserva enviada!', 'Aguardando confirmação.');
      setHorarioSelecionado(null);
      carregarReservas(dataSelecionada); // atualiza a lista de ocupados na hora
    } catch (erro) {
      // Aqui aparece a mensagem de conflito vinda do bookingService,
      // caso alguém tenha reservado esse horário entre o carregamento e o clique.
      Alert.alert('Não foi possível reservar', erro.message);
    }
  }

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.titulo}>{espaco.nome}</Text>

      <Calendar
        minDate={new Date().toISOString().split('T')[0]}
        onDayPress={(dia) => {
          setDataSelecionada(dia.dateString);
          setHorarioSelecionado(null);
        }}
        markedDates={
          dataSelecionada ? { [dataSelecionada]: { selected: true } } : {}
        }
      />

      {dataSelecionada && (
        <View style={styles.horarios}>
          <Text style={styles.subtitulo}>Horários para {dataSelecionada}</Text>
          <View style={styles.grade}>
            {HORARIOS.map((horario) => {
              const ocupado = horarioEstaOcupado(horario);
              const selecionado = horario === horarioSelecionado;
              return (
                <TouchableOpacity
                  key={horario}
                  disabled={ocupado}
                  onPress={() => setHorarioSelecionado(horario)}
                  style={[
                    styles.slot,
                    ocupado && styles.slotOcupado,
                    selecionado && styles.slotSelecionado,
                  ]}
                >
                  <Text
                    style={[
                      styles.slotTexto,
                      (ocupado || selecionado) && styles.slotTextoClaro,
                    ]}
                  >
                    {horario}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          <TouchableOpacity style={styles.botaoConfirmar} onPress={handleConfirmar}>
            <Text style={styles.botaoConfirmarTexto}>Confirmar reserva</Text>
          </TouchableOpacity>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  titulo: { fontSize: 22, fontWeight: 'bold', marginBottom: 12 },
  subtitulo: { fontSize: 16, fontWeight: '600', marginTop: 16, marginBottom: 8 },
  horarios: { marginTop: 8 },
  grade: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  slot: {
    borderWidth: 1,
    borderColor: '#2563eb',
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 12,
    marginRight: 8,
    marginBottom: 8,
  },
  slotOcupado: { borderColor: '#ccc', backgroundColor: '#eee' },
  slotSelecionado: { backgroundColor: '#2563eb' },
  slotTexto: { color: '#2563eb' },
  slotTextoClaro: { color: '#fff' },
  botaoConfirmar: {
    backgroundColor: '#16a34a',
    padding: 14,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 16,
    marginBottom: 32,
  },
  botaoConfirmarTexto: { color: '#fff', fontWeight: 'bold' },
});
