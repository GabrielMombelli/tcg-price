import React from 'react'
import { NavigationContainer } from '@react-navigation/native'
import { createStackNavigator } from '@react-navigation/stack'

import BuscaScreen from '../screens/BuscaScreen'
import DetalhesScreen from '../screens/DetalhesScreen'

const Stack = createStackNavigator()

export default function AppNavigator() {
  return (
    <NavigationContainer>
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

      </Stack.Navigator>
    </NavigationContainer>
  )
}