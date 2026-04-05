import React, { useState } from 'react'
import { StyleSheet, Text, View, TextInput, TouchableOpacity, FlatList, ActivityIndicator } from 'react-native'
import { buscarCartasPorNome } from '../api/api'
import Carta from '../components/Carta'

export default function BuscaScreen({ navigation }) {
  const [nomePokemon, setNomePokemon] = useState('')
  const [cartas, setCartas] = useState([])
  const [carregando, setCarregando] = useState(false)
  const [raridadeFiltro, setRaridadeFiltro] = useState('')
  const [colecaoFiltro, setColecaoFiltro] = useState('')

  const buscarCartas = async () => {
    if (nomePokemon.trim().length < 2) {
      alert("Digite pelo menos 2 letras do nome do Pokémon")
      return
    }

    setCarregando(true)

    try {
      let cartasEncontradas = await buscarCartasPorNome(nomePokemon)

      if (raridadeFiltro) {
        cartasEncontradas = cartasEncontradas.filter(carta =>
          carta.rarity?.toLowerCase().includes(raridadeFiltro.toLowerCase())
        )
      }

      if (colecaoFiltro) {
        cartasEncontradas = cartasEncontradas.filter(carta =>
          carta.set?.name?.toLowerCase().includes(colecaoFiltro.toLowerCase())
        )
      }

      cartasEncontradas.sort((a, b) => a.name.localeCompare(b.name))

      setCartas(cartasEncontradas || [])

    } catch (erro) {
      alert("Erro ao buscar cartas")
    } finally {
      setCarregando(false)
    }
  }

  const limparBusca = () => {
    setNomePokemon('')
    setCartas([])
    setRaridadeFiltro('')
    setColecaoFiltro('')
  }

  return (
    <View style={styles.container}>

      <View style={styles.cabecalho}>
        <Text style={styles.titulo}>Busca Pokémon TCG</Text>
        <TouchableOpacity 
          style={styles.botaoMinhasCartas} 
          onPress={() => navigation.navigate('MyCards')} 
        >
          <Text style={styles.textoMinhasCartas}>Minhas Cartas</Text>
        </TouchableOpacity>
      </View>

      <TextInput
        style={styles.input}
        placeholder="Buscar Pokémon (ex: Charizard)..."
        value={nomePokemon}
        onChangeText={setNomePokemon}
      />

      <TextInput
        style={styles.input}
        placeholder="Filtrar por raridade (ex: Rare)"
        value={raridadeFiltro}
        onChangeText={setRaridadeFiltro}
      />

      <TextInput
        style={styles.input}
        placeholder="Filtrar por coleção (ex: Phantom Forces)"
        value={colecaoFiltro}
        onChangeText={setColecaoFiltro}
      />

      <View style={styles.botoes}>
        <TouchableOpacity style={styles.botaoBuscar} onPress={buscarCartas}>
          <Text style={styles.textoBotao}>Buscar</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.botaoLimpar} onPress={limparBusca}>
          <Text style={styles.textoBotaoLimpar}>Limpar</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.listaContainer}>
        {carregando ? (
          <ActivityIndicator size="large" color="#333" />
        ) : cartas.length === 0 ? (
          <Text style={styles.vazio}>Nenhuma carta encontrada</Text>
        ) : (
          <FlatList
            data={cartas}
            keyExtractor={(item) => item.id}
            showsVerticalScrollIndicator={true}
            contentContainerStyle={{ paddingBottom: 20 }}
            renderItem={({ item }) => (
              <Carta
                carta={item}
                onPress={() =>
                  navigation.navigate('Detalhes', { carta: item })
                }
              />
            )}
          />
        )}
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#fff',
  },

  cabecalho: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  
  titulo: {
    fontSize: 20,
    fontWeight: 'bold',
  },

  botaoMinhasCartas: {
    backgroundColor: '#10b981',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
  },

  textoMinhasCartas: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 14,
  },

  input: {
    backgroundColor: '#f2f2f2',
    padding: 12,
    borderRadius: 10,
    marginBottom: 10,
  },

  botoes: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 10,
  },

  botaoBuscar: {
    flex: 1,
    backgroundColor: '#2563eb',
    padding: 12,
    borderRadius: 10,
    alignItems: 'center',
  },

  botaoLimpar: {
    flex: 1,
    backgroundColor: '#e5e7eb',
    padding: 12,
    borderRadius: 10,
    alignItems: 'center',
  },

  textoBotao: {
    color: '#fff',
    fontWeight: 'bold',
  },

  textoBotaoLimpar: {
    color: '#333',
    fontWeight: 'bold',
  },

  listaContainer: {
    flex: 1, 
    marginTop: 10,
  },

  vazio: {
    textAlign: 'center',
    marginTop: 20,
    color: '#666',
  },
})