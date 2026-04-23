import React, { useState } from 'react'
import { StyleSheet, Text, View, Image, ScrollView, Alert, Modal } from 'react-native'
import { Button, Surface } from 'react-native-paper'
// Persistência de dados local (Offline-first): Alternativa nativa ao LocalStorage da web
import AsyncStorage from '@react-native-async-storage/async-storage'
import { MaterialCommunityIcons } from '@expo/vector-icons'

export default function DetalhesScreen({ route }) {
  //Extrai os dados da carta passados pela tela anterior via Stack Navigation
  const { carta } = route.params || {}
  // Controle de estado para interface sobreposta (Overlay/Modal)
  const [modalVisivel, setModalVisivel] = useState(false)
  const [opcoesVariantes, setOpcoesVariantes] = useState([])

  //Impede a renderização se o parâmetro for nulo
  if (!carta) {
    return (
      <View style={[styles.container, styles.centerScreen]}>
        <Text style={styles.textoErro}>Erro no sistema: Nenhuma carta encontrada.</Text>
      </View>
    )
  }

  //Analisa a estrutura do JSON da API para decidir o fluxo de salvamento
  const iniciarSalvamento = () => {
    //Extrai dinamicamente as chaves (tipos de preço) do objeto
    if (carta.tcgplayer?.prices) {
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

  //Lida com leitura e gravação no sistema de arquivos do dispositivo
  const confirmarSalvamento = async (variante) => {
    setModalVisivel(false)

    try {
      //Lê a string do banco e converte para Array JavaScript
      const data = await AsyncStorage.getItem('@minhasCartas')
      let cartas = data ? JSON.parse(data) : []

      cartas.push({
        ...carta,
        // Gera um ID único na instância para permitir salvar a mesma carta múltiplas vezes
        idInstancia: `${carta.id}-${Date.now()}`,
        varianteSalva: variante
      })

      await AsyncStorage.setItem('@minhasCartas', JSON.stringify(cartas))
      Alert.alert('Capturada!', `Carta (${variante}) adicionada à Pokédex!`)
    } catch {
      Alert.alert('Erro ao salvar', 'O banco de dados falhou.')
    }
  }

  //Constrói elementos JSX iterando sobre propriedades de um objeto complexo
const renderizarPrecos = () => {
    const elementosPreco = []

    if (carta.tcgplayer?.prices) {
      Object.entries(carta.tcgplayer.prices).forEach(([tipo, dados]) => {
        const valor = dados.mid || dados.market || dados.low
        if (valor) {
          elementosPreco.push(
            <Text key={`tcg-${tipo}`} style={styles.preco}>
              TCG ({tipo.toUpperCase()}): ${valor.toFixed(2)}
            </Text>
          )
        }
      })
    }

    if (carta.cardmarket?.prices) {
      const cm = carta.cardmarket.prices

      if (cm.trendPrice) {
        elementosPreco.push(
          <Text key="cm-trend" style={styles.preco}>
            CardMarket: €{cm.trendPrice.toFixed(2)}
          </Text>
        )
      }

      if (cm.reverseHoloTrend) {
        elementosPreco.push(
          <Text key="cm-rev-trend" style={styles.preco}>
            CardMarket REV. HOLO: €{cm.reverseHoloTrend.toFixed(2)}
          </Text>
        )
      }
    }
    // Fallback visual caso a carta não tenha nenhum dado financeiro
    if (elementosPreco.length === 0) {
      return <Text style={styles.preco}>SEM DADOS DE MERCADO</Text>
    }

    return elementosPreco
  }
  
  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>

      <View style={styles.pokedexHeader}>
        <View style={styles.bigLightBorder}>
          <View style={styles.bigBlueLight} />
        </View>

        <View style={styles.smallLightsContainer}>
          <View style={[styles.smallLight, { backgroundColor: '#ef4444' }]} />
          <View style={[styles.smallLight, { backgroundColor: '#facc15' }]} />
          <View style={[styles.smallLight, { backgroundColor: '#22c55e' }]} />
        </View>
      </View>
      {/* SURFACE: Componente do Paper que aplica sombras e elevações nativas (Material Design) */}
      <Surface style={styles.visorPrincipal} elevation={4}>
        <View style={styles.imagemContainer}>
          <Image source={{ uri: carta.images?.large }} style={styles.imagemCarta} />
        </View>

        <Surface style={styles.infoContainer} elevation={2}>
          <Text style={styles.nomeCarta}>{carta.name}</Text>

          <View style={styles.linhaStatus}>
            <View style={styles.badgeHp}>
              <MaterialCommunityIcons name="heart-pulse" size={16} color="#FFF" />
              <Text style={styles.textoBadge}>HP {carta.hp || '--'}</Text>
            </View>
            <View style={styles.badgeTipo}>
              {/* Encadeamento de métodos (join e toUpperCase) para formatar a array de tipos */}
              <MaterialCommunityIcons name="debian" size={16} color="#FFF" />
              <Text style={styles.textoBadge}>{carta.types?.join(', ').toUpperCase() || 'NORMAL'}</Text>
            </View>
          </View>
        </Surface>
      </Surface>

      <Button
        mode="contained"
        icon="pokeball"
        onPress={iniciarSalvamento}
        style={styles.botaoCapturar}
        contentStyle={{ paddingVertical: 8 }}
        labelStyle={styles.textoBotaoCapturar}
      >
        ADICIONAR À POKÉDEX
      </Button>

      <Surface style={styles.secaoMercado} elevation={3}>
        <View style={styles.tituloMercadoContainer}>
          <MaterialCommunityIcons name="currency-usd" size={20} color="#ffcb05" />
          <Text style={styles.tituloSecaoLCD}>CÂMBIO ATUAL</Text>
        </View>
        {/* Chamada da função de renderização dinâmica de subcomponentes JSX */}
        {renderizarPrecos()}
        <Text style={styles.precoDica}>*Sincronização de dados recentes</Text>
      </Surface>

      <Surface style={styles.visorSecundario} elevation={3}>
        <View style={styles.tituloAzulContainer}>
          <MaterialCommunityIcons name="sword-cross" size={20} color="#0284c7" />
          <Text style={styles.tituloSecaoAzul}>DADOS DE COMBATE</Text>
        </View>

        {carta.attacks && carta.attacks.length > 0 ? (
          carta.attacks.map((atk, i) => (
            <Surface key={i} style={styles.ataqueItem} elevation={1}>
              <View style={styles.ataqueCabecalho}>
                <View style={styles.ataqueNomeContainer}>
                  <MaterialCommunityIcons name="flash" size={16} color="#f59e0b" />
                  <Text style={styles.ataqueNome}>{atk.name.toUpperCase()}</Text>
                </View>
                <Text style={styles.ataqueDano}>{atk.damage || '--'}</Text>
              </View>

              <Text style={styles.ataqueTexto}>
                {atk.text || 'Nenhum efeito secundário registrado.'}
              </Text>
            </Surface>
          ))
        ) : (
          <Text style={{ textAlign: 'center', fontStyle: 'italic', marginTop: 10 }}>
            Nenhum ataque mapeado.
          </Text>
        )}
      </Surface>

      <Modal visible={modalVisivel} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <Surface style={styles.modalContent} elevation={5}>
            <Text style={styles.modalTitulo}>SELECIONAR VARIANTE</Text>

            {opcoesVariantes.map((tipo, i) => (
              <Button
                key={i}
                mode="contained-tonal"
                icon="hexagram-outline"
                onPress={() => confirmarSalvamento(tipo)}
                style={{ marginBottom: 10 }}
              >
                {tipo.toUpperCase()}
              </Button>
            ))}

            <Button icon="cancel" onPress={() => setModalVisivel(false)} textColor="#dc2626">
              Cancelar
            </Button>
          </Surface>
        </View>
      </Modal>

      <View style={{ height: 30 }} />
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#dc2626',
    padding: 15,
  },
  centerScreen: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  textoErro: {
    color: '#fff',
    fontWeight: 'bold',
  },
  pokedexHeader: {
    flexDirection: 'row',
    marginBottom: 15,
  },
  bigLightBorder: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
  },
  bigBlueLight: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#3b82f6',
  },
  smallLightsContainer: {
    flexDirection: 'row',
    marginLeft: 15,
    marginTop: 5,
  },
  smallLight: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 8,
  },
  visorPrincipal: {
    backgroundColor: '#e0f2fe',
    borderRadius: 12,
    padding: 15,
    marginBottom: 20,
    borderWidth: 4,
    borderColor: '#cbd5e1',
  },
  imagemContainer: {
    alignItems: 'center',
    marginBottom: 15,
  },
  imagemCarta: {
    width: 250,
    height: 350,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#0003',
  },
  infoContainer: {
    padding: 12,
    borderRadius: 8,
    backgroundColor: '#fff',
  },
  nomeCarta: {
    fontSize: 22,
    fontWeight: '900',
    textAlign: 'center',
    color: '#1e293b',
    marginBottom: 8,
    letterSpacing: 1,
  },
  linhaStatus: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 10,
  },
  badgeHp: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ef4444',
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 6,
    gap: 4,
  },
  badgeTipo: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#10b981',
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 6,
    gap: 4,
  },
  textoBadge: {
    color: '#FFF',
    fontWeight: 'bold',
    fontSize: 13,
    fontFamily: 'monospace',
  },
  botaoCapturar: {
    backgroundColor: '#facc15',
    borderRadius: 30,
    marginBottom: 25,
    borderWidth: 2,
    borderColor: '#ca8a04',
  },
  textoBotaoCapturar: {
    fontWeight: '900',
    color: '#422006',
    letterSpacing: 1,
    fontSize: 15,
  },
  secaoMercado: {
    backgroundColor: '#262626',
    padding: 15,
    borderRadius: 10,
    marginBottom: 25,
    alignItems: 'center',
    borderWidth: 3,
    borderColor: '#404040',
  },
  tituloMercadoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
    gap: 5,
  },
  tituloSecaoLCD: {
    color: '#ffcb05',
    fontWeight: 'bold',
    letterSpacing: 1,
  },
  preco: {
    color: '#4ade80',
    fontFamily: 'monospace',
    fontSize: 15,
    marginVertical: 2,
  },
  precoDica: {
    fontSize: 10,
    color: '#737373',
    marginTop: 10,
    fontFamily: 'monospace',
  },
  visorSecundario: {
    backgroundColor: '#e0f2fe',
    borderRadius: 12,
    padding: 15,
    borderWidth: 4,
    borderColor: '#cbd5e1',
  },
  tituloAzulContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 15,
    gap: 8,
  },
  tituloSecaoAzul: {
    fontWeight: '900',
    color: '#0284c7',
    fontSize: 16,
    letterSpacing: 1,
  },
  ataqueItem: {
    padding: 12,
    borderRadius: 8,
    marginBottom: 12,
    backgroundColor: '#fff',
  },
  ataqueCabecalho: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
    paddingBottom: 6,
    marginBottom: 6,
  },
  ataqueNomeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  ataqueNome: {
    fontWeight: 'bold',
    color: '#334155',
    fontSize: 15,
  },
  ataqueDano: {
    color: '#dc2626',
    fontWeight: '900',
    fontSize: 16,
  },
  ataqueTexto: {
    color: '#64748b',
    fontStyle: 'italic',
    fontSize: 13,
    lineHeight: 18,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: '#0009',
    justifyContent: 'center',
  },
  modalContent: {
    margin: 20,
    padding: 20,
    borderRadius: 12,
    backgroundColor: '#fff',
  },
  modalTitulo: {
    fontWeight: '900',
    marginBottom: 15,
    textAlign: 'center',
    color: '#1e293b',
  },
})