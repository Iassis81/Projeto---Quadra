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
