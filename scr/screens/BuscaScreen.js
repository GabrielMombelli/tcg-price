import React, { useState } from 'react'
import { View, FlatList, StyleSheet } from 'react-native'
import { TextInput, Button, Card, Text, ActivityIndicator, Searchbar } from 'react-native-paper'
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
      let resultado = await buscarCartasPorNome(nomePokemon)

      if (raridadeFiltro) {
        resultado = resultado.filter(c =>
          c.rarity?.toLowerCase().includes(raridadeFiltro.toLowerCase())
        )
      }

      if (colecaoFiltro) {
        resultado = resultado.filter(c =>
          c.set?.name?.toLowerCase().includes(colecaoFiltro.toLowerCase())
        )
      }

      setCartas(resultado)
    } catch {
      console.log('Erro ao buscar dados')
    } finally {
      setCarregando(false)
    }
  }

  const limpar = () => {
    setNomePokemon('')
    setRaridadeFiltro('')
    setColecaoFiltro('')
    setCartas([])
  }

  return (
    <View style={styles.container}>

      <View style={styles.headerContainer}>
        <View style={styles.luzesWrapper}>
          <View style={[styles.luz, styles.luzAzul]} />
          <View style={[styles.luzPequena, styles.luzVermelha]} />
          <View style={[styles.luzPequena, styles.luzAmarela]} />
          <View style={[styles.luzPequena, styles.luzVerde]} />
        </View>
        
        <Button 
          mode="contained-tonal" 
          icon="pokeball"
          onPress={() => navigation.navigate('MyCards')}
          style={styles.botaoMinhasCartas}
          labelStyle={styles.textoMinhasCartas}
        >
          Minhas Cartas
        </Button>
      </View>

      <Searchbar
        placeholder="Buscar Pokémon (ex: Charizard)..."
        value={nomePokemon}
        onChangeText={setNomePokemon}
        onIconPress={buscarCartas}
        onSubmitEditing={buscarCartas}
        style={styles.search}
        inputStyle={styles.searchInput}
        iconColor="#D32F2F"
      />

      <View style={styles.filtros}>
        <TextInput
          label="Raridade"
          value={raridadeFiltro}
          onChangeText={setRaridadeFiltro}
          style={styles.input}
          mode="outlined"
          activeOutlineColor="#1976D2"
          outlineColor="#E0E0E0"
        />

        <TextInput
          label="Coleção"
          value={colecaoFiltro}
          onChangeText={setColecaoFiltro}
          style={styles.input}
          mode="outlined"
          activeOutlineColor="#1976D2"
          outlineColor="#E0E0E0"
        />
      </View>

      <View style={styles.botoes}>
        <Button 
          mode="contained" 
          onPress={buscarCartas}
          style={styles.botaoBuscar}
          icon="magnify"
        >
          Buscar
        </Button>

        <Button 
          mode="outlined" 
          onPress={limpar}
          style={styles.botaoLimpar}
          textColor="#757575"
        >
          Resetar
        </Button>
      </View>

      <View style={styles.resultadoContainer}>
        {carregando ? (
          <View style={styles.centerView}>
            <ActivityIndicator size="large" color="#1976D2" />
            <Text style={styles.loadingTexto}>Realizando busca...</Text>
          </View>
        ) : cartas.length === 0 ? (
          <View style={styles.centerView}>
            <Text style={styles.vazioTexto}>Nenhum dado no visor atual.</Text>
          </View>
        ) : (
          <FlatList
            data={cartas}
            keyExtractor={(item) => item.id}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ padding: 8 }}
            renderItem={({ item }) => (
              <Card style={styles.card} mode="elevated">
                <Card.Content style={styles.cardContent}>
                  <Carta 
                    carta={item}
                    onPress={() =>
                      navigation.navigate('Detalhes', { carta: item })
                    }
                  />
                </Card.Content>
              </Card>
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
    backgroundColor: '#FAFAFA',
  },
  headerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  luzesWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  luz: {
    borderWidth: 2,
    borderColor: '#E0E0E0',
  },
  luzAzul: {
    backgroundColor: '#2196F3',
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 3,
    borderColor: '#BBDEFB',
  },
  luzPequena: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  luzVermelha: { 
    backgroundColor: '#F44336' 
  },
  luzAmarela: { 
    backgroundColor: '#FFC107' 
  },
  luzVerde: { 
    backgroundColor: '#4CAF50' 
  },
  botaoMinhasCartas: {
    backgroundColor: '#f443363b', 
    borderColor: '#F44336',
    borderWidth: 1,
  },
  textoMinhasCartas: {
    color: '#F44336',
    fontWeight: 'bold',
  },
  search: {
    marginBottom: 12,
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    elevation: 0,
  },
  searchInput: {
    fontSize: 16,
  },
  filtros: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  input: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  botoes: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 20,
  },
  botaoBuscar: {
    flex: 1,
    backgroundColor: '#D32F2F',
    borderRadius: 8,
    paddingVertical: 4,
  },
  botaoLimpar: {
    flex: 1,
    borderColor: '#BDBDBD',
    borderRadius: 8,
    paddingVertical: 4,
  },
  resultadoContainer: {
    flex: 1,
    backgroundColor: '#F0F4F8',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#CFD8DC',
    overflow: 'hidden',
  },
  centerView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingTexto: {
    marginTop: 12,
    color: '#546E7A',
    fontWeight: '500',
  },
  vazioTexto: {
    color: '#90A4AE',
    fontStyle: 'italic',
  },
  card: {
    marginBottom: 12,
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    elevation: 2,
  },
  cardContent: {
    padding: 0,
  }
})