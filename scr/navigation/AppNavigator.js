import React from 'react'
import { NavigationContainer } from '@react-navigation/native'
import { createStackNavigator } from '@react-navigation/stack'
// Importação das telas mantendo o princípio de Separação de Responsabilidades
import BuscaScreen from '../screens/BuscaScreen'
import DetalhesScreen from '../screens/DetalhesScreen'
import MyCardsScreen from '../screens/MyCardsScreen' 

const Stack = createStackNavigator()

export default function AppNavigator() {
  return (
     // NavigationContainer gerencia o estado global e o histórico de roteamento
    <NavigationContainer>
      {/* Navegação estruturada em Pilha (LIFO - Last In, First Out) */}
      <Stack.Navigator initialRouteName="Busca">
        
        <Stack.Screen 
          name="Busca" 
          component={BuscaScreen} 
          options={{ title: 'Pokédex TCG' }}
        />

        <Stack.Screen 
          name="Detalhes" 
          component={DetalhesScreen} 
          options={{ title: 'Detalhes da Carta' }}
        />

        <Stack.Screen 
          name="MyCards" 
          component={MyCardsScreen} 
          options={{ title: 'Minhas Cartas' }}
        />

      </Stack.Navigator>
    </NavigationContainer>
  )
}