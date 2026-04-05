import React from 'react'
import { View, Text, StyleSheet, Image, TouchableOpacity } from 'react-native'

export default function Carta({ carta, onPress }) {
  return (
    <TouchableOpacity style={styles.container} onPress={onPress}>
      
      <Image
        source={{ uri: carta.images?.small }}
        style={styles.imagem}
        resizeMode="contain"
      />

      <View style={styles.info}>
        <Text style={styles.nome}>{carta.name}</Text>

        <Text style={styles.detalhe}>
          {carta.supertype} • {carta.set?.name}
        </Text>

        <Text style={styles.raridade}>
          {carta.rarity || 'Sem raridade'}
        </Text>
      </View>

    </TouchableOpacity>
  )
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: '#f5f5f5',
    borderRadius: 12,
    padding: 10,
    marginBottom: 10,
    alignItems: 'center',
  },

  imagem: {
    width: 70,
    height: 100,
    borderRadius: 6,
    marginRight: 10,
  },

  info: {
    flex: 1,
  },

  nome: {
    color: '#333',
    fontSize: 16,
    fontWeight: 'bold',
  },

  detalhe: {
    color: '#666',
    marginTop: 4,
  },

  raridade: {
    color: '#facc15',
    marginTop: 6,
  },
})