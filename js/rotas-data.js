/**
 * js/rotas-data.js
 * Banco de dados de rotas populares no Brasil e métodos auxiliares.
 */

const rotasDB = {
  // Lista com 20 rotas populares no Brasil (distâncias aproximadas via malha rodoviária)
  rotas: [
    { origem: "São Paulo, SP", destino: "Rio de Janeiro, RJ", distancia: 435 },
    { origem: "São Paulo, SP", destino: "Belo Horizonte, MG", distancia: 586 },
    { origem: "São Paulo, SP", destino: "Curitiba, PR", distancia: 408 },
    { origem: "São Paulo, SP", destino: "Brasília, DF", distancia: 1015 },
    { origem: "Rio de Janeiro, RJ", destino: "Belo Horizonte, MG", distancia: 434 },
    { origem: "Rio de Janeiro, RJ", destino: "Vitória, ES", distancia: 521 },
    { origem: "Rio de Janeiro, RJ", destino: "Salvador, BA", distancia: 1649 },
    { origem: "Belo Horizonte, MG", destino: "Brasília, DF", distancia: 737 },
    { origem: "Salvador, BA", destino: "Recife, PE", distancia: 800 },
    { origem: "Salvador, BA", destino: "Fortaleza, CE", distancia: 1183 },
    { origem: "Recife, PE", destino: "Fortaleza, CE", distancia: 800 },
    { origem: "Curitiba, PR", destino: "Florianópolis, SC", distancia: 300 },
    { origem: "Curitiba, PR", destino: "Porto Alegre, RS", distancia: 711 },
    { origem: "Porto Alegre, RS", destino: "Florianópolis, SC", distancia: 476 },
    { origem: "Goiânia, GO", destino: "Brasília, DF", distancia: 209 },
    { origem: "Cuiabá, MT", destino: "Campo Grande, MS", distancia: 694 },
    { origem: "Belém, PA", destino: "São Luís, MA", distancia: 806 },
    { origem: "Manaus, AM", destino: "Boa Vista, RR", distancia: 785 },
    { origem: "Natal, RN", destino: "João Pessoa, PB", distancia: 185 },
    { origem: "Maceió, AL", destino: "Aracaju, SE", distancia: 275 }
  ],

  /**
   * Retorna um array único e ordenado contendo todas as cidades presentes no banco de dados.
   * @returns {string[]} Lista de cidades ordenadas alfabeticamente.
   */
  getAllCities: function() {
    const cidadesSet = new Set();

    this.rotas.forEach(rota => {
      cidadesSet.add(rota.origem);
      cidadesSet.add(rota.destino);
    });

    // Converte o Set para Array e ordena alfabeticamente
    return Array.from(cidadesSet).sort((a, b) => a.localeCompare(b, 'pt-BR'));
  },

  /**
   * Busca a distância entre duas cidades em ambas as direções.
   * @param {string} origem - Cidade de partida.
   * @param {string} destino - Cidade de chegada.
   * @returns {number|null} Distância em km ou null caso não encontre a rota.
   */
  findDistance: function(origem, destino) {
    if (!origem || !destino) return null;

    // Função interna para normalizar as strings (remover espaços extras e padronizar caixa baixa)
    const normalizar = (texto) => texto.trim().toLowerCase();

    const origemNormalizada = normalizar(origem);
    const destinoNormalizada = normalizar(destino);

    // Busca no array de rotas
    const rotaEncontrada = this.rotas.find(rota => {
      const oDB = normalizar(rota.origem);
      const dDB = normalizar(rota.destino);

      // Verifica Ida (Origem -> Destino) ou Volta (Destino -> Origem)
      return (oDB === mindset(origemNormalizada) && dDB === destinoNormalizada) || 
             (oDB === destinoNormalizada && dDB === origemNormalizada);
    });

    function mindset(val) { return val; } // Auxiliar de escopo de bloco limpo

    return rotaEncontrada ? rotaEncontrada.distancia : null;
  }
};