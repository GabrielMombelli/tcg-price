import React, { useState } from 'react'
import { StyleSheet, Text, View, Image, ScrollView, Alert, Modal, TouchableOpacity } from 'react-native'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { Button } from 'react-native-paper'

export default function DetalhesScreen({ route }) {
  const { carta } = route.params || {}
  const [modalVisivel, setModalVisivel] = useState(false)
  const [opcoesVariantes, setOpcoesVariantes] = useState([])

  if (!carta) {
    return (
      <View style={styles.containerErro}>
        <Text style={styles.textoErro}>Erro: Nenhuma carta encontrada.</Text>
      </View>
    )
  }

  const iniciarSalvamento = () => {
    if (carta.tcgplayer && carta.tcgplayer.prices) {
      const tipos = Object.keys(carta.tcgplayer.prices)

      if (tipos.length > 1) {
        setOpcoesVariantes(tipos)
        setModalVisivel(true)
        return
      } else if (tipos.length === 1) {
        confirmarSalvamento(tipos[0])
        return
      }
    }

    confirmarSalvamento('Padrão')
  }

  const confirmarSalvamento = async (variante) => {
    setModalVisivel(false)

    try {
      const cartasSalvasJSON = await AsyncStorage.getItem('@minhasCartas')
      let cartasSalvas = cartasSalvasJSON ? JSON.parse(cartasSalvasJSON) : []

      const copiaDaCarta = {
        ...carta,
        idInstancia: `${carta.id}-${Date.now()}`,
        varianteSalva: variante
      }

      cartasSalvas.push(copiaDaCarta)
      await AsyncStorage.setItem('@minhasCartas', JSON.stringify(cartasSalvas))

      const nomeFormatado = variante !== 'Padrão' ? ` (${variante.charAt(0).toUpperCase() + variante.slice(1)})` : ''
      Alert.alert('Sucesso', `Carta${nomeFormatado} adicionada à coleção!`)
    } catch (error) {
      console.error(error)
      Alert.alert('Erro', 'Não foi possível salvar a carta.')
    }
  }

  const renderizarPrecos = () => {
    let precosEncontrados = []

    if (carta.tcgplayer && carta.tcgplayer.prices) {
      Object.keys(carta.tcgplayer.prices).forEach((tipo) => {
        const dadosPreco = carta.tcgplayer.prices[tipo]
        const valor = dadosPreco.mid || dadosPreco.market || dadosPreco.low

        if (valor) {
          const nomeFormatado = tipo.charAt(0).toUpperCase() + tipo.slice(1)
          precosEncontrados.push(`${nomeFormatado}: $${valor.toFixed(2)}`)
        }
      })
    }

    if (precosEncontrados.length === 0 && carta.cardmarket?.prices?.averageSellPrice) {
      precosEncontrados.push(`Cardmarket (Média): $${carta.cardmarket.prices.averageSellPrice.toFixed(2)}`)
    }

    if (precosEncontrados.length > 0) {
      return precosEncontrados.map((preco, index) => (
        <Text key={index} style={styles.precoDinâmico}>{preco}</Text>
      ))
    } else {
      return <Text style={styles.precoDinâmico}>Sem dados de mercado</Text>
    }
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

      <Button
        mode="contained"
        onPress={iniciarSalvamento}
        style={{ marginHorizontal: 20, marginBottom: 20 }}
      >
        Adicionar à Coleção
      </Button>

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
        {renderizarPrecos()}
        <Text style={styles.precoDica}>*Valores baseados em vendas recentes</Text>
      </View>

      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisivel}
        onRequestClose={() => setModalVisivel(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitulo}>Qual versão você possui?</Text>

            {opcoesVariantes.map((tipo, index) => {
              const nomeFormatado = tipo.charAt(0).toUpperCase() + tipo.slice(1)
              return (
                <TouchableOpacity
                  key={index}
                  style={styles.botaoOpcao}
                  onPress={() => confirmarSalvamento(tipo)}
                >
                  <Text style={styles.textoOpcao}>{nomeFormatado}</Text>
                </TouchableOpacity>
              )
            })}

            <TouchableOpacity
              style={styles.botaoCancelar}
              onPress={() => setModalVisivel(false)}
            >
              <Text style={styles.textoCancelar}>Cancelar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

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
  precoDica: {
    fontSize: 12,
    color: '#aaa',
    marginTop: 5,
  },
  precoDinâmico: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 8,
  },
  textoVazio: {
    fontSize: 14,
    color: '#555',
    fontStyle: 'italic',
  },

  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#fff',
    padding: 25,
    borderRadius: 15,
    width: '85%',
    alignItems: 'stretch',
  },
  modalTitulo: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
    color: '#333',
  },
  botaoOpcao: {
    backgroundColor: '#1d2c5e',
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
    alignItems: 'center',
  },
  textoOpcao: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  botaoCancelar: {
    padding: 15,
    borderRadius: 10,
    marginTop: 10,
    alignItems: 'center',
    backgroundColor: '#e5e7eb',
  },
  textoCancelar: {
    color: '#374151',
    fontSize: 16,
    fontWeight: 'bold',
  },
})