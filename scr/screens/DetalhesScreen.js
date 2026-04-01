import React from 'react'
import { StyleSheet, Text, View, Image, ScrollView } from 'react-native'

export default function DetalhesScreen({ route }) {
  const { carta } = route.params || {}

  if (!carta) {
    return (
      <View style={styles.containerErro}>
        <Text style={styles.textoErro}>Erro: Nenhuma carta encontrada.</Text>
      </View>
    )
  }

  return (
    <ScrollView style={styles.container}>
      
      <View style={styles.imagemContainer}>
        <Image 
          source={{ uri: carta.images?.large }} 
          style={styles.imagemCarta} 
          resizeMode="contain"
        />
      </View>

      <View style={styles.infoContainer}>
        <Text style={styles.nomeCarta}>{carta.name}</Text>
        <Text style={styles.subtitulo}>
          HP: {carta.hp || 'N/A'} | Tipo: {carta.types ? carta.types.join(', ') : 'N/A'}
        </Text>
      </View>

      <View style={styles.secaoContainer}>
        <Text style={styles.tituloSecao}>Ataques</Text>
        {carta.attacks ? (
          carta.attacks.map((ataque, index) => (
            <View key={index} style={styles.ataqueItem}>
              <View style={styles.ataqueCabecalho}>
                <Text style={styles.ataqueNome}>{ataque.name}</Text>
                <Text style={styles.ataqueDano}>{ataque.damage ? `${ataque.damage} Dano` : ''}</Text>
              </View>
              <Text style={styles.ataqueTexto}>{ataque.text || 'Sem efeito adicional.'}</Text>
            </View>
          ))
        ) : (
          <Text style={styles.textoVazio}>Esta carta não possui ataques.</Text>
        )}
      </View>

      <View style={styles.secaoMercado}>
        <Text style={styles.tituloSecaoBranco}>Mercado Atual (USD)</Text>
        <Text style={styles.precoTexto}>
          Preço Médio: ${carta.tcgplayer?.prices?.normal?.mid || carta.cardmarket?.prices?.averageSellPrice || 'Indisponível'}
        </Text>
        <Text style={styles.precoDica}>*Valores sujeitos a alteração</Text>
      </View>

    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  containerErro: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  textoErro: {
    fontSize: 18,
    color: 'red',
  },
  imagemContainer: {
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4.65,
    elevation: 8,
  },
  imagemCarta: {
    width: 300,
    height: 420,
    borderRadius: 15, 
  },
  infoContainer: {
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  nomeCarta: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
  },
  subtitulo: {
    fontSize: 16,
    color: '#666',
    marginTop: 5,
  },
  secaoContainer: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  tituloSecao: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#e3350d', 
    borderBottomWidth: 2,
    borderBottomColor: '#e3350d',
    paddingBottom: 5,
  },
  ataqueItem: {
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 8,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  ataqueCabecalho: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 5,
  },
  ataqueNome: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  ataqueDano: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#e3350d',
  },
  ataqueTexto: {
    fontSize: 14,
    color: '#555',
  },
  secaoMercado: {
    backgroundColor: '#1d2c5e', 
    marginHorizontal: 20,
    padding: 20,
    borderRadius: 10,
    marginBottom: 30,
    alignItems: 'center',
  },
  tituloSecaoBranco: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#ffcb05',
    marginBottom: 10,
  },
  precoTexto: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
  },
  precoDica: {
    fontSize: 12,
    color: '#aaa',
    marginTop: 5,
  }
})