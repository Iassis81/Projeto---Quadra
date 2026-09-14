# 📅 Sistema de Agendamento de Quadras / Salas

Projeto para praticar: validação de datas/horários, evitar conflitos de reserva,
autenticação de usuários e listagem com filtros.

---

## 🧱 Tecnologias usadas (e por quê)

| Tecnologia | Para que serve | Por que essa escolha |
|---|---|---|
| **React Native (Expo)** | Criar o app mobile | Você escreve uma vez e roda em Android e iOS. Expo facilita muito pra quem tá começando (sem precisar mexer em Android Studio/Xcode). |
| **Firebase Authentication** | Login/cadastro de usuários | Pronto, seguro, e você não precisa criar servidor de login do zero. |
| **Firebase Firestore** | Banco de dados | Banco de dados "em nuvem", fácil de consultar, e atualiza em tempo real. |

---

## 🗂️ Como o projeto está organizado

```
quadra-agendamento/
├── firebaseConfig.js          <- Conexão com o Firebase (TODOS usam este arquivo)
├── App.js                     <- Ponto de entrada: organiza a navegação entre telas
├── src/
│   ├── context/
│   │   └── AuthContext.js     <- [Integrante 1] Guarda "quem está logado" pro app inteiro
│   ├── services/
│   │   ├── authService.js     <- [Integrante 1] Funções de login/cadastro/logout
│   │   ├── spacesService.js   <- [Integrante 2] Funções de CRUD dos espaços
│   │   └── bookingService.js  <- [Integrante 3] Funções de reserva + validação de conflito
│   ├── screens/
│   │   ├── auth/               <- [Integrante 1] Telas de login, cadastro, perfil
│   │   ├── spaces/              <- [Integrante 2] Telas de listagem/busca/cadastro de espaços
│   │   └── booking/             <- [Integrante 3] Tela de calendário e "minhas reservas"
│   └── components/
│       └── SpaceCard.js        <- Componente visual reutilizável (usado pelo Integrante 2)
```

### A ideia de "services" (muito importante para entender o projeto)

Cada `service` é um arquivo que **só conversa com o Firebase**. As telas (`screens`) nunca
falam com o Firebase diretamente — elas chamam uma função do `service`. Isso separa
"como os dados são buscados/salvos" de "como a tela é desenhada".

Vantagem prática pro trabalho em grupo: o Integrante 3 pode escrever a lógica de
`bookingService.js` sem precisar saber como a tela do Integrante 2 foi desenhada —
ele só precisa saber que vai *receber* um `spaceId` (o ID do espaço escolhido).

---

## 🔌 Como as 3 partes se conectam (o mapa geral)

1. **Integrante 1 (Autenticação)** cria o `AuthContext`, que guarda o usuário logado
   (`uid`, nome, e-mail). Esse contexto envolve o app inteiro no `App.js`.
2. **Integrante 2 (Espaços)** cria a listagem de espaços. Quando o usuário toca em um
   espaço, ele navega para a tela de agendamento passando o `spaceId` selecionado.
3. **Integrante 3 (Agendamento)** recebe esse `spaceId` (do Integrante 2) e o `uid` do
   usuário logado (do Integrante 1, via `AuthContext`) para criar a reserva.

Ou seja: **o `spaceId` viaja do Integrante 2 pro Integrante 3**, e o **`uid` viaja do
Integrante 1 pro Integrante 3**. O Integrante 3 é quem "junta" as duas peças na hora
de salvar a reserva.

```
[Integrante 1: Login] --uid do usuário logado--> [Integrante 3: Reserva]
[Integrante 2: Lista de Espaços] --spaceId escolhido--> [Integrante 3: Reserva]
```

---

## 🚀 Passo a passo para rodar o projeto

### 1. Instalar as ferramentas
```bash
npm install -g expo-cli
```

### 2. Criar o projeto Expo (na sua máquina, fora daqui)
```bash
npx create-expo-app quadra-agendamento
cd quadra-agendamento
```

### 3. Copiar os arquivos deste pacote
Copie o conteúdo desta pasta (`firebaseConfig.js`, `App.js`, `src/`) para dentro
da pasta que o Expo criou, substituindo o `App.js` padrão.

### 4. Instalar as dependências
```bash
npm install firebase @react-navigation/native @react-navigation/native-stack @react-navigation/bottom-tabs react-native-screens react-native-safe-area-context @react-native-async-storage/async-storage react-native-calendars
```

### 5. Criar o projeto no Firebase
1. Acesse https://console.firebase.google.com e crie um projeto.
2. Em **Build > Authentication**, ative o método "E-mail/senha".
3. Em **Build > Firestore Database**, crie o banco (modo de teste, pra começar).
4. Em **Configurações do projeto > Geral**, crie um "App Web" e copie as credenciais.
5. Cole essas credenciais no arquivo `firebaseConfig.js`.

### 6. Rodar o app
```bash
npx expo start
```
Escaneie o QR code com o app **Expo Go** no seu celular.

---

## 🗄️ Estrutura dos dados no Firestore (as "tabelas")

**Coleção `users`** (documento com ID = uid do Firebase Auth)
```
{ nome, email, telefone }
```

**Coleção `spaces`**
```
{ nome, foto (url), tipo, precoHora }
```

**Coleção `reservations`**
```
{ spaceId, userId, data (ex: "2026-09-15"), horaInicio (ex: "14:00"),
  horaFim (ex: "15:00"), status ("Pendente" | "Confirmada" | "Cancelada") }
```

---

## ✅ Ordem sugerida de desenvolvimento (para não travar o grupo)

1. Todo mundo junto: configurar o Firebase e o `firebaseConfig.js` (10 min).
2. Integrante 1 trabalha em `AuthContext` + telas de login/cadastro **primeiro**,
   porque os outros dois dependem de saber "quem está logado".
3. Integrante 2 e Integrante 3 podem trabalhar em paralelo, usando dados fake
   (mockados) enquanto o login não está pronto.
4. No fim, todos se juntam no `App.js` para plugar a navegação entre as telas.
# Projeto---Quadra



Dev_Jhon_web
