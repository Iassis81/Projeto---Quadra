// App.js
// PONTO DE ENTRADA DO APP — aqui as 3 partes se juntam.
//
// Estrutura:
// 1. <AuthProvider> embrulha TUDO, para que useAuth() funcione em qualquer tela.
// 2. Se não há usuário logado -> mostra as telas de Login/Cadastro (Integrante 1).
// 3. Se há usuário logado -> mostra as abas principais do app:
//    Espaços (Integrante 2), Minhas Reservas e Perfil (Integrante 1),
//    além da tela de Agendamento (Integrante 3), aberta a partir dos Espaços.

import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { ActivityIndicator, View } from 'react-native';

import { AuthProvider, useAuth } from './src/context/AuthContext';

// Telas do Integrante 1
import LoginScreen from './src/screens/auth/LoginScreen';
import RegisterScreen from './src/screens/auth/RegisterScreen';
import ProfileScreen from './src/screens/auth/ProfileScreen';

// Telas do Integrante 2
import SpacesListScreen from './src/screens/spaces/SpacesListScreen';
import SpaceFormScreen from './src/screens/spaces/SpaceFormScreen';

// Telas do Integrante 3
import BookingCalendarScreen from './src/screens/booking/BookingCalendarScreen';
import MyBookingsScreen from './src/screens/booking/MyBookingsScreen';

const AuthStack = createNativeStackNavigator();
const SpacesStack = createNativeStackNavigator();
const Tabs = createBottomTabNavigator();

// --- Fluxo de quem NÃO está logado (Integrante 1) ---
function AuthRoutes() {
  return (
    <AuthStack.Navigator>
      <AuthStack.Screen name="Login" component={LoginScreen} options={{ headerShown: false }} />
      <AuthStack.Screen name="Cadastro" component={RegisterScreen} />
    </AuthStack.Navigator>
  );
}

// --- Pilha de "Espaços": lista -> agendamento (conecta Integrante 2 e 3) ---
function SpacesRoutes() {
  return (
    <SpacesStack.Navigator>
      <SpacesStack.Screen
        name="ListaDeEspacos"
        component={SpacesListScreen}
        options={{ title: 'Espaços' }}
      />
      <SpacesStack.Screen
        name="Agendamento"
        component={BookingCalendarScreen}
        options={({ route }) => ({ title: route.params.espaco.nome })}
      />
      <SpacesStack.Screen
        name="NovoEspaco"
        component={SpaceFormScreen}
        options={{ title: 'Cadastrar espaço' }}
      />
    </SpacesStack.Navigator>
  );
}

// --- Fluxo de quem ESTÁ logado: abas principais do app ---
function AppRoutes() {
  return (
    <Tabs.Navigator>
      <Tabs.Screen name="Espaços" component={SpacesRoutes} options={{ headerShown: false }} />
      <Tabs.Screen name="MinhasReservas" component={MyBookingsScreen} options={{ title: 'Reservas' }} />
      <Tabs.Screen name="Perfil" component={ProfileScreen} />
    </Tabs.Navigator>
  );
}

// Decide qual fluxo mostrar, com base no AuthContext (Integrante 1)
function RoutesDecider() {
  const { usuario, carregando } = useAuth();

  if (carregando) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return usuario ? <AppRoutes /> : <AuthRoutes />;
}

export default function App() {
  return (
    <AuthProvider>
      <NavigationContainer>
        <RoutesDecider />
      </NavigationContainer>
    </AuthProvider>
  );
}
