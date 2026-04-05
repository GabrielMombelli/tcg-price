import React, { useState, useCallback } from 'react'
import { View, Text, FlatList, StyleSheet, Alert, ActivityIndicator } from 'react-native'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { useFocusEffect } from '@react-navigation/native'
import { Surface, Button } from 'react-native-paper'
import Carta from '../components/Carta'

export default function MyCardsScreen({ navigation }) {
    const [cartasSalvas, setCartasSalvas] = useState([])
    const [loading, setLoading] = useState(true)

    useFocusEffect(
        useCallback(() => {
            carregarCartas()
        }, [])
    )

    const carregarCartas = async () => {
        try {
            setLoading(true)
            const dados = await AsyncStorage.getItem('@minhasCartas')
            setCartasSalvas(dados ? JSON.parse(dados) : [])
        } catch (erro) {
            console.error('Erro ao carregar cartas:', erro)
        } finally {
            setLoading(false)
        }
    }

    const removerCarta = (id) => {
        Alert.alert(
            'Remover Registro',
            'Deseja remover esta entrada da Pokédex?',
            [
                { text: 'Cancelar', style: 'cancel' },
                {
                    text: 'Confirmar',
                    style: 'destructive',
                    onPress: async () => {
                        const novasCartas = cartasSalvas.filter(c => c.idInstancia !== id)
                        setCartasSalvas(novasCartas)
                        await AsyncStorage.setItem('@minhasCartas', JSON.stringify(novasCartas))
                    }
                }
            ]
        )
    }

    const obterPrecoCarta = (carta) => {
        if (carta.varianteSalva && carta.varianteSalva !== 'Padrão' && carta.tcgplayer?.prices) {
            const p = carta.tcgplayer.prices[carta.varianteSalva]
            if (p) {
                return p.mid || p.market || p.low || 0
            }        
        }

        if (carta.tcgplayer?.prices) {
            for (const key in carta.tcgplayer.prices) {
                const p = carta.tcgplayer.prices[key]
                const valor = p.mid || p.market || p.low
                if (valor) {
                    return valor
                }
            }
        }

        if (carta.cardmarket?.prices?.averageSellPrice) {
            return carta.cardmarket.prices.averageSellPrice
        }
        return 0
    }

    const calcularResumo = () => {
        let valorTotal = 0
        let semValor = 0

        cartasSalvas.forEach(carta => {
            const preco = obterPrecoCarta(carta)
            if (preco > 0){ 
                valorTotal += preco
            } else {
                semValor++
            }
        })

        return {
            totalCartas: cartasSalvas.length,
            valorTotal: valorTotal.toFixed(2),
            semValor
        }
    }

    const resumo = calcularResumo()

    if (loading) {
        return (
            <View style={[styles.container, styles.centerScreen]}>
                <ActivityIndicator size="large" color="#fff" />
                <Text style={styles.loadingText}>Sincronizando dados...</Text>
            </View>
        )
    }

    return (
        <View style={styles.container}>

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

            <Surface style={styles.resumoContainer} elevation={4}>
                <Text style={styles.resumoTitulo}>REGISTRO DA POKÉDEX</Text>

                <View style={styles.resumoLinha}>
                    <Text style={styles.resumoLabel}>CARTAS REGISTRADAS:</Text>
                    <Text style={styles.resumoValor}>{resumo.totalCartas}</Text>
                </View>

                <View style={styles.resumoLinha}>
                    <Text style={styles.resumoLabel}>VALOR DE MERCADO:</Text>
                    <Text style={styles.resumoValorDinheiro}>${resumo.valorTotal}</Text>
                </View>

                <View style={styles.resumoLinha}>
                    <Text style={styles.resumoLabel}>DADOS INCOMPLETOS:</Text>
                    <Text style={styles.resumoValorAlerta}>{resumo.semValor}</Text>
                </View>
            </Surface>

            <Surface style={styles.visorPrincipal} elevation={5}>
                {cartasSalvas.length === 0 ? (
                    <View style={styles.vazioContainer}>
                        <Text style={styles.vazioTitulo}>BANCO DE DADOS VAZIO</Text>
                        <Text style={styles.vazioSubtitulo}>
                            Capture novos dados para{'\n'}iniciar sua Pokédex.
                        </Text>
                    </View>
                ) : (
                    <FlatList
                        data={cartasSalvas}
                        keyExtractor={(item) => item.idInstancia}
                        contentContainerStyle={styles.listaCartas}
                        showsVerticalScrollIndicator={false}
                        renderItem={({ item }) => {
                            const precoItem = obterPrecoCarta(item)

                            return (
                                <Surface style={styles.cartaContainer} elevation={3}>

                                    <Carta
                                        carta={item}
                                        onPress={() => navigation.navigate('Detalhes', { carta: item })}
                                    />

                                    <View style={styles.dividerCarta} />

                                    <View style={styles.rodapeCarta}>
                                        <View>
                                            <Text style={styles.precoTexto}>
                                                {precoItem > 0 ? `$ ${precoItem.toFixed(2)} USD` : 'SEM REGISTRO'}
                                            </Text>

                                            {item.varianteSalva && item.varianteSalva !== 'Padrão' && (
                                                <Text style={styles.varianteTexto}>
                                                    VARIANTE: {item.varianteSalva.toUpperCase()}
                                                </Text>
                                            )}
                                        </View>

                                        <Button
                                            mode="contained"
                                            icon="delete"
                                            buttonColor="#D32F2F"
                                            textColor="#FFF"
                                            compact
                                            onPress={() => removerCarta(item.idInstancia)}
                                            style={styles.botaoRemover}
                                            labelStyle={styles.removerTexto}
                                        >
                                            REMOVER
                                        </Button>
                                    </View>
                                </Surface>
                            )
                        }}
                    />
                )}
            </Surface>

        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#dc2626',
        paddingTop: 10,
        paddingHorizontal: 15,
    },
    centerScreen: {
        justifyContent: 'center',
        alignItems: 'center',
    },
    loadingText: {
        color: '#fff',
        marginTop: 10,
        fontWeight: 'bold',
    },
    pokedexHeader: {
        flexDirection: 'row',
        marginBottom: 15,
    },
    bigLightBorder: {
        width: 70,
        height: 70,
        borderRadius: 35,
        backgroundColor: '#fff',
        justifyContent: 'center',
        alignItems: 'center',
    },
    bigBlueLight: {
        width: 50,
        height: 50,
        borderRadius: 25,
        backgroundColor: '#3b82f6',
    },
    smallLightsContainer: {
        flexDirection: 'row',
        marginLeft: 15,
        marginTop: 10,
    },
    smallLight: {
        width: 15,
        height: 15,
        borderRadius: 7.5,
        marginRight: 8,
    },
    resumoContainer: {
        backgroundColor: '#262626',
        padding: 15,
        borderRadius: 10,
        marginBottom: 15,
    },
    resumoTitulo: {
        fontSize: 16,
        fontWeight: '900',
        color: '#ffcb05',
        marginBottom: 10,
        textAlign: 'center',
        letterSpacing: 2,
    },
    resumoLinha: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 4,
    },
    resumoLabel: {
        color: '#a3a3a3',
        fontSize: 13,
        fontWeight: 'bold',
        fontFamily: 'monospace',
    },
    resumoValor: {
        color: '#fff',
        fontFamily: 'monospace',
    },
    resumoValorDinheiro: {
        color: '#4ade80',
        fontFamily: 'monospace',
    },
    resumoValorAlerta: {
        color: '#fca5a5',
        fontFamily: 'monospace',
    },
    visorPrincipal: {
        flex: 1,
        backgroundColor: '#D1F2EB',
        borderRadius: 16,
        borderWidth: 6,
        borderColor: '#9E9E9E',
        marginBottom: 15,
        overflow: 'hidden',
    },
    listaCartas: {
        padding: 12,
        paddingBottom: 20,
    },

    vazioContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    vazioTitulo: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#00796B',
        marginBottom: 8,
        fontFamily: 'monospace',
        textAlign: 'center',
    },
    vazioSubtitulo: {
        textAlign: 'center',
        color: '#004D40',
        fontFamily: 'monospace',
        lineHeight: 20,
    },
    cartaContainer: {
        backgroundColor: '#FFF',
        marginBottom: 16,
        borderRadius: 8,
        padding: 12,
        borderWidth: 2,
        borderColor: '#424242',
    },
    dividerCarta: {
        height: 1,
        backgroundColor: '#E0E0E0',
        marginVertical: 12,
    },
    rodapeCarta: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    precoTexto: {
        fontWeight: '900',
        fontSize: 16,
        color: '#2E7D32',
        fontFamily: 'monospace',
    },
    varianteTexto: {
        fontSize: 12,
        color: '#757575',
        marginTop: 2,
        fontWeight: 'bold',
        fontFamily: 'monospace',
    },
    botaoRemover: {
        borderWidth: 2,
        borderColor: '#B71C1C',
        borderRadius: 8,
    },
    removerTexto: {
        fontWeight: '900',
        fontSize: 12,
        letterSpacing: 1,
    },
})