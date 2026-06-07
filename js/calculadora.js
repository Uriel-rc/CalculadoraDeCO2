/**
 * js/calculadora.js
 * Lógica matemática refinada para cálculo de emissões e créditos de carbono.
 */

const Calculadora = {
  
  /**
   * Calcula a emissão de CO² para um meio de transporte específico.
   */
  calcularEmissao: function(distanciaKm, meioTransporte) {
    if (typeof CONFIG === 'undefined' || !CONFIG.fatores_de_emissao) {
      console.error("Configurações globais (CONFIG) não encontradas.");
      return 0;
    }

    // Validação de segurança para distância inválida
    const distancia = parseFloat(distanciaKm);
    if (isNaN(distancia) || distancia <= 0) return 0;

    const fator = CONFIG.fatores_de_emissao[meioTransporte];
    if (fator === undefined) {
      console.warn(`Fator de emissão para o modo '${meioTransporte}' não encontrado.`);
      return 0;
    }

    return parseFloat((distancia * fator).toFixed(2));
  },

  /**
   * Calcula todos os modos e retorna a economia/eficiência em relação ao carro.
   */
  calcularTodosModos: function(distanciaKm) {
    if (typeof CONFIG === 'undefined' || !CONFIG.fatores_de_emissao) {
      console.error("Configurações globais (CONFIG) não encontradas.");
      return [];
    }

    const resultados = [];
    const emissaoCarro = this.calcularEmissao(distanciaKm, 'carro');

    for (const modo in CONFIG.fatores_de_emissao) {
      if (CONFIG.fatores_de_emissao.hasOwnProperty(modo)) {
        const emissaoModo = this.calcularEmissao(distanciaKm, modo);
        let economiaVsCarro = 0;

        // Nova lógica: Calcula a % de emissão evitada (Economia Verde)
        if (emissaoCarro > 0) {
          economiaVsCarro = ((emissaoCarro - emissaoModo) / emissaoCarro) * 100;
        }

        resultados.push({
          modo: modo,
          emissao: emissaoModo,
          // Se for o próprio carro, a economia é 0. Se for bike, é 100%
          porcentagemEconomia: parseFloat(economiaVsCarro.toFixed(2))
        });
      }
    }

    // Ordena do menos poluente para o mais poluente
    return resultados.sort((a, b) => a.emissao - b.emissao);
  },

  /**
   * Calcula o custo exato e a necessidade real de créditos para compensação.
   */
  custoMedioCreditoCarbono: function(distanciaKm, meioTransporte) {
    if (typeof CONFIG === 'undefined' || !CONFIG.credito_de_carbono) {
      console.error("Configurações de crédito de carbono não encontradas.");
      return { emissaoKg: 0, creditosExatos: 0, creditosMinimosInteiros: 0, custoMedioBrl: 0 };
    }

    const emissaoKg = this.calcularEmissao(distanciaKm, meioTransporte);
    const kgPorCredito = CONFIG.credito_de_carbono.kg_por_credito;
    
    // Crédito exato fracionado
    const creditosExatos = emissaoKg / kgPorCredito;
    
    // Créditos mínimos inteiros que ele precisaria comprar comercialmente (mínimo de 1 se houver emissão)
    const creditosMinimosInteiros = emissaoKg > 0 ? Math.ceil(creditosExatos) : 0;

    const precoMin = CONFIG.credito_de_carbono.preco_minimo_brl;
    const precoMax = CONFIG.credito_de_carbono.preco_maximo_brl;
    const precoMedioCredito = (precoMin + precoMax) / 2;

    // Custo baseado na pegada exata gerada
    const custoMedioBrl = creditosExatos * precoMedioCredito;

    return {
      emissaoKg: emissaoKg,
      creditosExatos: parseFloat(creditosExatos.toFixed(4)),
      creditosMinimosInteiros: creditosMinimosInteiros,
      custoMedioBrl: parseFloat(custoMedioBrl.toFixed(2))
    };
  }
};