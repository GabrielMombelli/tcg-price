const URL_BASE = "https://api.pokemontcg.io/v2"
const API_KEY = "tcg_65318545e1c74004bb36450f73ede56b"

export const buscarCartasPorNome = async (nome) => {
  try {
    const resposta = await fetch(`${URL_BASE}/cards?q=name:${nome}`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json','X-Api-Key': API_KEY }
    })
    
    const dados = await resposta.json()
    return dados.data

  } catch (erro) {
    console.error("Erro na API:", erro)
    throw erro
  }
}