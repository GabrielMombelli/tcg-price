const URL_BASE = "https://api.pokemontcg.io/v2"
const API_KEY = "tcg_65318545e1c74004bb36450f73ede56b"

export const buscarCartasPorNome = async (nome) => {
  try {
    //O 'trim()' remove espaços em branco acidentais antes e depois do texto,
    // e o 'toLowerCase()' padroniza tudo em letras minúsculas. Isso evita falhas bobas na busca.
    const nomeFormatado = nome.trim().toLowerCase()

    if (nomeFormatado.length < 2) {
      alert('Adicione pelo menos duas letras para a busca')
      return []
    }
    //Adiciona curingas (*) para permitir buscar partes do nome do Pokémon
    const termoBusca = `"*${nomeFormatado}*"`;

    const querySegura = encodeURIComponent(termoBusca);
    // Utiliza a Fetch API nativa para fazer a requisição HTTP.
    // A chave da API é enviada de forma segura no cabeçalho da requisição, 
    // conforme exigido pela documentação da API do Pokémon TCG.
    const resposta = await fetch(
      `${URL_BASE}/cards?q=name:${querySegura}`,
      { method: 'GET', headers: { 'Content-Type': 'application/json', 'X-Api-Key': API_KEY } }
    )

    const dados = await resposta.json()
    return dados.data

  } catch (erro) {
    console.error("Erro na API:", erro)
    throw erro
  }
}