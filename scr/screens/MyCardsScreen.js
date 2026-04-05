import React, { useState, useCallback } from 'react'
import { View, Text, FlatList, StyleSheet, TouchableOpacity, Alert, ActivityIndicator } from 'react-native'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { useFocusEffect } from '@react-navigation/native'
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
            'Remover Carta',
            'Tem certeza que deseja remover esta carta?',
            [
                { text: 'Cancelar', style: 'cancel' },
                {
                    text: 'Remover',
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

        if (carta.tcgplayer && carta.tcgplayer.prices) {
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
            if (preco > 0) {
                valorTotal += preco
            } else {
                semValor += 1
            }
        })

        return {
            totalCartas: cartasSalvas.length,
            valorTotal: valorTotal.toFixed(2),
            semValor: semValor
        }
    }

    const resumo = calcularResumo()

    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#2563eb" />
            </View>
        )
    }

    if (cartasSalvas.length === 0) {
        return (
            <View style={styles.container}>
                <Text style={styles.vazio}>Você ainda não salvou nenhuma carta.</Text>
            </View>
        )
    }

    return (
        <View style={styles.container}>

            <View style={styles.resumoContainer}>
                <Text style={styles.resumoTitulo}>Resumo da Coleção</Text>

                <View style={styles.resumoLinha}>
                    <Text style={styles.resumoLabel}>Total de Cartas:</Text>
                    <Text style={styles.resumoValor}>{resumo.totalCartas}</Text>
                </View>

                <View style={styles.resumoLinha}>
                    <Text style={styles.resumoLabel}>Valor Estimado:</Text>
                    <Text style={styles.resumoValorDinheiro}>${resumo.valorTotal}</Text>
                </View>

                <View style={styles.resumoLinha}>
                    <Text style={styles.resumoLabel}>Sem dados de mercado:</Text>
                    <Text style={styles.resumoValorAlerta}>{resumo.semValor} carta(s)</Text>
                </View>
            </View>

            <FlatList
                data={cartasSalvas}
                keyExtractor={(item) => item.idInstancia}
                contentContainerStyle={{ paddingBottom: 50 }}
                showsVerticalScrollIndicator={false}
                renderItem={({ item }) => {
                    const precoItem = obterPrecoCarta(item)
                    return (
                        <View style={styles.cartaContainer}>

                            <Carta
                                carta={item}
                                onPress={() => navigation.navigate('Detalhes', { carta: item })}
                            />

                            <View style={styles.rodapeCarta}>
                                <View>
                                    <Text style={styles.precoTexto}>
                                        Preço: {precoItem > 0 ? `$${precoItem.toFixed(2)}` : 'Indisponível'}
                                    </Text>

                                    {item.varianteSalva && item.varianteSalva !== 'Padrão' && (
                                        <Text style={{ fontSize: 13, color: '#6b7280', marginTop: 2 }}>
                                            Versão: {item.varianteSalva.charAt(0).toUpperCase() + item.varianteSalva.slice(1)}
                                        </Text>
                                    )}
                                </View>

                                <TouchableOpacity
                                    style={styles.removerBotao}
                                    onPress={() => removerCarta(item.idInstancia)}
                                >
                                    <Text style={styles.removerTexto}>Remover</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    )
                }}
            />
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 16,
        backgroundColor: '#fff',
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    resumoContainer: {
        backgroundColor: '#1d2c5e',
        padding: 15,
        borderRadius: 12,
        marginBottom: 20,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5,
    },
    resumoTitulo: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#ffcb05',
        marginBottom: 10,
        textAlign: 'center',
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(255, 255, 255, 0.2)',
        paddingBottom: 8,
    },
    resumoLinha: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 5,
    },
    resumoLabel: {
        color: '#e0e0e0',
        fontSize: 16,
    },
    resumoValor: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
    },
    resumoValorDinheiro: {
        color: '#4ade80',
        fontSize: 16,
        fontWeight: 'bold',
    },
    resumoValorAlerta: {
        color: '#fca5a5',
        fontSize: 16,
        fontWeight: 'bold',
    },

    vazio: {
        textAlign: 'center',
        marginTop: 50,
        fontSize: 16,
        color: '#555',
    },
    cartaContainer: {
        marginBottom: 15,
        borderRadius: 10,
        padding: 10,
        backgroundColor: '#f2f2f2',
        borderWidth: 1,
        borderColor: '#e5e7eb',
    },
    rodapeCarta: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: 10,
        paddingHorizontal: 5,
    },
    removerBotao: {
        backgroundColor: '#ef4444',
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 8,
    },
    removerTexto: {
        color: '#fff',
        fontWeight: 'bold',
        fontSize: 14,
    },
    precoTexto: {
        fontWeight: 'bold',
        color: '#1f2937',
        fontSize: 16,
    },
})