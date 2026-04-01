import React, { useState } from 'react'
import { StyleSheet, Text, View, TextInput, Button, FlatList, ActivityIndicator, TouchableOpacity } from 'react-native'
import { buscarCartasPorNome } from '../api/api' 

export default function BuscaScreen({ navigation }) {
  const [nomePokemon, setNomePokemon] = useState('')
  const [cartas, setCartas] = useState([])
  const [carregando, setCarregando] = useState(false)

  const buscarCartas = async () => {
    if (nomePokemon.trim() === '') {
      return
    }

    setCarregando(true)

    try {
      const cartasEncontradas = await buscarCartasPorNome(nomePokemon)
      setCartas(cartasEncontradas || []) 
    } catch (erro) {
        alert("Ocorreu um erro ao buscar as cartas. Verifique sua conexão.")
    } finally {
       setCarregando(false) 
    }
  }

  return (
    <View style={styles.container}>
      <Text style={styles.titulo}>Busca Pokémon TCG</Text>

      <TextInput
        style={styles.input}
        placeholder="Digite o nome do Pokémon..."
        value={nomePokemon}
        onChangeText={setNomePokemon}
      />

      <Button title="Pesquisar" onPress={buscarCartas} />

      <View style={{ flex: 1, marginTop: 20 }}>
        {carregando ? (
          <ActivityIndicator size="large" color="#0000ff" style={styles.loading} />
        ) : (
          <FlatList
            data={cartas}
            keyExtractor={(item) => item.id} 
            contentContainerStyle={{ paddingBottom: 50 }}
            showsVerticalScrollIndicator={true}
            renderItem={({ item }) => (
              <TouchableOpacity 
                style={styles.cartaContainer}
                onPress={() => navigation.navigate('Detalhes', { carta: item })}
              >
                <Text style={styles.nomeCarta}>{item.name}</Text>
                <Text>Raridade: {item.rarity ? item.rarity : 'Não disponível'}</Text>
              </TouchableOpacity>
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
    paddingTop: 20, 
    paddingHorizontal: 20,
    backgroundColor: '#f5f5f5',
  },
  titulo: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 10,
    borderRadius: 5,
    marginBottom: 10,
    backgroundColor: '#fff',
  },
  loading: {
    marginTop: 20,
    alignSelf: 'center',
  },
  cartaContainer: {
    padding: 15,
    backgroundColor: '#fff',
    marginBottom: 10,
    borderRadius: 8,
    elevation: 2,
  },
  nomeCarta: {
    fontSize: 18,
    fontWeight: 'bold',
  }
})