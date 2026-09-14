// src/services/bookingService.js
// [Integrante 3 - Agendamento]
//
// Esta é a parte mais "lógica" do projeto: precisamos garantir que duas
// pessoas não reservem o MESMO espaço no MESMO horário.
//
// A estratégia é simples e fácil de entender:
// 1. Buscar todas as reservas já existentes para aquele espaço, naquela data.
// 2. Verificar se algum dos horários já existentes "esbarra" no horário novo.
// 3. Só criar a reserva se não houver esbarrão (conflito).

import {
  collection,
  addDoc,
  getDocs,
  query,
  where,
  doc,
  updateDoc,
  deleteDoc,
} from 'firebase/firestore';
import { db } from '../../firebaseConfig';

const reservationsRef = collection(db, 'reservations');

// Converte "14:30" em minutos (870), para facilitar a comparação de horários.
function paraMinutos(horaTexto) {
  const [horas, minutos] = horaTexto.split(':').map(Number);
  return horas * 60 + minutos;
}

// Dois intervalos [inicioA, fimA] e [inicioB, fimB] só NÃO se sobrepõem se
// um terminar antes do outro começar. Em qualquer outro caso, há conflito.
function horariosSeSobrepoe(inicioA, fimA, inicioB, fimB) {
  return inicioA < fimB && inicioB < fimA;
}

// Verifica se uma combinação de data + horário já ficou no passado,
// comparando com o momento exato em que a função é chamada (new Date()).
// Usada tanto na tela (bloqueio visual) quanto aqui no service (bloqueio
// de segurança, caso alguém tente pular a interface).
export function horarioJaPassou(data, horario) {
  const agora = new Date();
  const [ano, mes, dia] = data.split('-').map(Number);
  const [hora, minuto] = horario.split(':').map(Number);
  const momentoDoSlot = new Date(ano, mes - 1, dia, hora, minuto);
  return momentoDoSlot < agora;
}

// Busca as reservas de um espaço em uma data específica (ignora as canceladas).
export async function buscarReservasDoDia(spaceId, data) {
  const q = query(
    reservationsRef,
    where('spaceId', '==', spaceId),
    where('data', '==', data)
  );
  const snapshot = await getDocs(q);
  return snapshot.docs
    .map((doc) => ({ id: doc.id, ...doc.data() }))
    .filter((reserva) => reserva.status !== 'Cancelada');
}

// Verifica se um novo horário entra em conflito com alguma reserva existente.
export function existeConflito(reservasDoDia, horaInicio, horaFim) {
  const inicioNovo = paraMinutos(horaInicio);
  const fimNovo = paraMinutos(horaFim);

  return reservasDoDia.some((reserva) =>
    horariosSeSobrepoe(
      inicioNovo,
      fimNovo,
      paraMinutos(reserva.horaInicio),
      paraMinutos(reserva.horaFim)
    )
  );
}

// Cria a reserva SOMENTE se não houver conflito.
// Recebe spaceId (vem do Integrante 2) e userId (vem do Integrante 1).
export async function criarReserva({ spaceId, userId, data, horaInicio, horaFim }) {
  if (paraMinutos(horaInicio) >= paraMinutos(horaFim)) {
    throw new Error('O horário de início precisa ser antes do horário de fim.');
  }

  // Validação de segurança: mesmo que alguém consiga chamar essa função
  // ignorando a tela (ex: direto pelo console), o Firestore nunca recebe
  // uma reserva para um horário que já passou.
  if (horarioJaPassou(data, horaInicio)) {
    throw new Error('Não é possível reservar um horário que já passou.');
  }

  // Busca as reservas JÁ EXISTENTES agora, na hora exata da confirmação —
  // não reaproveita nenhuma lista antiga da tela. Isso garante que, se
  // outra pessoa reservou esse mesmo horário um segundo atrás, o conflito
  // é pego aqui, e não é preciso confiar na lista que a tela carregou antes.
  const reservasDoDia = await buscarReservasDoDia(spaceId, data);

  if (existeConflito(reservasDoDia, horaInicio, horaFim)) {
    throw new Error('Esse horário já está reservado. Escolha outro.');
  }

  await addDoc(reservationsRef, {
    spaceId,
    userId,
    data,
    horaInicio,
    horaFim,
    status: 'Pendente',
  });
}

// Lista as reservas de um usuário (para a tela "Minhas Reservas")
export async function listarReservasDoUsuario(userId) {
  const q = query(reservationsRef, where('userId', '==', userId));
  const snapshot = await getDocs(q);
  return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
}

// Os únicos status válidos no sistema. Ter essa lista num só lugar evita
// erro de digitação (ex: escrever "cancelada" com c minúsculo em algum canto).
export const STATUS_RESERVA = {
  PENDENTE: 'Pendente',
  CONFIRMADA: 'Confirmada',
  CANCELADA: 'Cancelada',
};

// Atualiza o status de uma reserva já existente.
// reservaId é o "id" do documento (o mesmo que vem em cada item retornado
// por listarReservasDoUsuario/buscarReservasDoDia).
export async function atualizarStatusReserva(reservaId, novoStatus) {
  const valoresValidos = Object.values(STATUS_RESERVA);
  if (!valoresValidos.includes(novoStatus)) {
    throw new Error(`Status inválido: ${novoStatus}`);
  }
  await updateDoc(doc(db, 'reservations', reservaId), { status: novoStatus });
}

// Cancela uma reserva EXCLUINDO o documento do Firestore (em vez de só
// marcar o status como "Cancelada"). Isso é importante: buscarReservasDoDia
// já ignora reservas com status "Cancelada", mas excluir de verdade é mais
// direto e garante que o horário liberado nunca conte como ocupado em
// nenhuma consulta futura, mesmo que algum código novo esqueça de filtrar
// por status.
export async function cancelarReserva(reservaId) {
  await deleteDoc(doc(db, 'reservations', reservaId));
}
