// src/screens/booking/BookingCalendarScreen.js
// [Integrante 3 - Agendamento]
//
// Esta tela RECEBE dois dados de fora:
// - `espaco` -> veio da navegação, entregue pelo Integrante 2 (SpacesListScreen)
// - `usuario` -> vem do useAuth(), entregue pelo Integrante 1 (AuthContext)
//
// É aqui que as 3 partes do projeto se encontram de verdade.

import React, { useState, useCallback } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert, ScrollView } from 'react-native';
import { Calendar } from 'react-native-calendars';
import { useFocusEffect } from '@react-navigation/native';
import { useAuth } from '../../context/AuthContext';
import {
  buscarReservasDoDia,
  criarReserva,
  horarioJaPassou,
} from '../../services/bookingService';

// Lista fixa de horários possíveis, de 1 em 1 hora, das 8h às 20h.
// (Em um projeto mais avançado, isso poderia vir do próprio cadastro do espaço.)
const HORARIOS = Array.from({ length: 12 }, (_, i) => {
  const hora = 8 + i;
  return `${String(hora).padStart(2, '0')}:00`;
});

// Data de hoje no formato "AAAA-MM-DD", igual ao que o calendário usa.
function dataDeHoje() {
  return new Date().toISOString().split('T')[0];
}

export default function BookingCalendarScreen({ route }) {
  const { espaco } = route.params; // 👈 recebido do Integrante 2
  const { usuario } = useAuth(); // 👈 recebido do Integrante 1

  const [dataSelecionada, setDataSelecionada] = useState(null);
  const [reservasDoDia, setReservasDoDia] = useState([]);
  const [horarioSelecionado, setHorarioSelecionado] = useState(null);

  const carregarReservas = useCallback(async (data) => {
    if (!data) return;
    const reservas = await buscarReservasDoDia(espaco.id, data);
    setReservasDoDia(reservas);
  }, [espaco.id]);

  // useFocusEffect (em vez de useEffect simples) recarrega a lista de
  // reservas toda vez que esta tela volta a ficar visível — por exemplo,
  // se o usuário cancelar uma reserva em "Minhas reservas" e voltar pra cá,
  // o horário liberado precisa aparecer disponível sem precisar sair do
  // app e entrar de novo.
  useFocusEffect(
    useCallback(() => {
      carregarReservas(dataSelecionada);
    }, [dataSelecionada, carregarReservas])
  );

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

  // Um horário está "no passado" se a combinação data selecionada + esse
  // horário específico já ficou para trás em relação a agora. Reutiliza a
  // mesma função que o bookingService usa para a validação de segurança,
  // então a regra do visual e a regra do backend nunca ficam desalinhadas.
  function horarioPassado(horario) {
    if (!dataSelecionada) return false;
    return horarioJaPassou(dataSelecionada, horario);
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
      // criarReserva refaz, no servidor, tanto a checagem de conflito
      // quanto a checagem de horário passado — não confiamos apenas no
      // estado local da tela, que pode estar desatualizado.
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
      // Aqui aparece a mensagem de conflito ou de horário passado vinda
      // do bookingService, caso algo tenha mudado entre o carregamento
      // da tela e o clique em confirmar.
      Alert.alert('Não foi possível reservar', erro.message);
    }
  }

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.titulo}>{espaco.nome}</Text>

      <Calendar
        // minDate já impede escolher uma data ANTERIOR a hoje diretamente
        // no calendário — isso cobre a regra "se a data for anterior à
        // atual, todos os horários dessa data ficam indisponíveis".
        minDate={dataDeHoje()}
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

          {/* Legenda simples pra deixar claro o que cada cor significa */}
          <View style={styles.legenda}>
            <View style={styles.legendaItem}>
              <View style={[styles.legendaBolinha, styles.legendaDisponivel]} />
              <Text style={styles.legendaTexto}>Disponível</Text>
            </View>
            <View style={styles.legendaItem}>
              <View style={[styles.legendaBolinha, styles.legendaOcupado]} />
              <Text style={styles.legendaTexto}>Ocupado</Text>
            </View>
            <View style={styles.legendaItem}>
              <View style={[styles.legendaBolinha, styles.legendaPassado]} />
              <Text style={styles.legendaTexto}>Passou</Text>
            </View>
          </View>

          <View style={styles.grade}>
            {HORARIOS.map((horario) => {
              const ocupado = horarioEstaOcupado(horario);
              const passado = horarioPassado(horario);
              const selecionado = horario === horarioSelecionado;
              // Um horário só pode ser tocado se não estiver ocupado E não
              // tiver passado. Qualquer um dos dois motivos já desabilita.
              const indisponivel = ocupado || passado;

              return (
                <TouchableOpacity
                  key={horario}
                  disabled={indisponivel}
                  onPress={() => setHorarioSelecionado(horario)}
                  style={[
                    styles.slot,
                    ocupado && styles.slotOcupado,
                    passado && !ocupado && styles.slotPassado,
                    selecionado && styles.slotSelecionado,
                  ]}
                >
                  <Text
                    style={[
                      styles.slotTexto,
                      (indisponivel || selecionado) && styles.slotTextoClaro,
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
  subtitulo: { fontSize: 16, fontWeight: '600', marginTop: 16, marginBottom: 4 },
  horarios: { marginTop: 8 },
  legenda: { flexDirection: 'row', gap: 16, marginBottom: 12, marginTop: 4 },
  legendaItem: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  legendaBolinha: { width: 10, height: 10, borderRadius: 5 },
  legendaDisponivel: { backgroundColor: '#2563eb' },
  legendaOcupado: { backgroundColor: '#ccc' },
  legendaPassado: { backgroundColor: '#f3f4f6', borderWidth: 1, borderColor: '#d1d5db' },
  legendaTexto: { fontSize: 11, color: '#666' },
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
  // Ocupado: cinza sólido, indicando que já tem reserva ativa nesse horário.
  slotOcupado: { borderColor: '#ccc', backgroundColor: '#eee' },
  // Passado: um cinza mais claro e "apagado", diferente do ocupado, pra
  // deixar claro que o motivo de estar bloqueado é outro (o tempo passou,
  // não que alguém reservou).
  slotPassado: { borderColor: '#e5e7eb', backgroundColor: '#f9fafb', opacity: 0.6 },
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
