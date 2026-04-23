import React from 'react'
import { View, Text, StyleSheet, Image, TouchableOpacity } from 'react-native'

// COMPONENTE FUNCIONAL (Stateless): Recebe os dados via 'props' (carta e onPress).
export default function Carta({ carta, onPress }) {
// UX e INTERAÇÃO: O TouchableOpacity fornece feedback imediato ao usuário.
// O evento de clique (onPress) é passado para o componente pai (Inversão de Controle).
  return (
    <TouchableOpacity style={styles.container} onPress={onPress}>
      
      {/* 
          Utilizamos o Optional Chaining (?.) na leitura de 'carta.images?.small'. 
          Isso previne um "Fatal Error" (Crash no aplicativo) caso a API retorne um payload incompleto ou sem a imagem. */}
      <Image
        source={{ uri: carta.images?.small }}
        style={styles.imagem}
        // resizeMode="contain" garante a integridade visual do asset, evitando distorções (aspect ratio)
        resizeMode="contain"
      />

      <View style={styles.info}>
        <Text style={styles.nome}>{carta.name}</Text>

        <Text style={styles.detalhe}>
          {carta.supertype} • {carta.set?.name}
        </Text>
        {/* 
            Se a propriedade 'carta.rarity' vier nula ou undefined da API (valor falsy),
            o operador '||' garante a exibição de um valor padrão, evitando que a interface fique com buracos vazios. */}
        <Text style={styles.raridade}>
          {carta.rarity || 'Sem raridade'}
        </Text>
      </View>

    </TouchableOpacity>
  )
}

const styles = StyleSheet.create({
  container: {
     // LAYOUT RESPONSIVO (FLEXBOX): 'row' estrutura a imagem e os textos lado a lado.
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