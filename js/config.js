/**
 * js/config.js
 * Configurações globais de fatores de emissão, metadados e comportamento da UI.
 */

const CONFIG = {
  // Fatores de emissão em kg de CO² por km rodado
  fatores_de_emissao: {
    bike: 0,
    carro: 0.12,
    onibus: 0.089,
    caminhao: 0.96
  },

  // Metadados dos modos de transporte para a interface
  modos_de_transporte: {
    bike: {
      label: "Bicicleta",
      icone: "🚲",
      cor: "#1ebd64" // Verde Folha
    },
    carro: {
      label: "Carro",
      icone: "🚗",
      cor: "#ffb703" // Amarelo/Laranja
    },
    onibus: {
      label: "Ônibus",
      icone: "🚌",
      cor: "#0b3c1b" // Verde Musgo
    },
    caminhao: {
      label: "Caminhão",
      icone: "🚛",
      cor: "#d90429" // Vermelho Atenção
    }
  },

  // Dados de precificação e conversão de Créditos de Carbono
  credito_de_carbono: {
    kg_por_credito: 1000,
    preco_minimo_brl: 50,
    preco_maximo_brl: 150
  },

  /**
   * Popula dinamicamente os elementos Datalist para auxiliar a digitação de cidades.
   */
  preencherDatalist: function() {
    // Garante que o banco de dados de rotas está carregado
    if (typeof rotasDB === 'undefined' || !rotasDB.getAllCities) {
      console.warn("rotasDB não encontrado. Certifique-se de que rotas-data.js foi carregado antes.");
      return;
    }

    const cidades = rotasDB.getAllCities();
    
    // Cria ou captura o datalist no documento
    let datalist = document.getElementById("lista-cidades");
    if (!datalist) {
      datalist = document.createElement("datalist");
      datalist.id = "lista-cidades";
      document.body.appendChild(datalist);
    }

    // Limpa opções existentes e adiciona as cidades da base
    datalist.innerHTML = "";
    cidades.forEach(cidade => {
      const option = document.createElement("option");
      option.value = cidade;
      datalist.appendChild(option);
    });

    // Vincula o datalist criado aos inputs de origem e destino
    const inputOrigem = document.getElementById("origem");
    const inputDestino = document.getElementById("destino");
    
    if (inputOrigem) inputOrigem.setAttribute("list", "lista-cidades");
    if (inputDestino) inputDestino.setAttribute("list", "lista-cidades");
  }
};

/* ==========================================================================
   LÓGICA DE COMPORTAMENTO DO INPUT DE DISTÂNCIA E CHECKBOX MANUAL
   ========================================================================== */
document.addEventListener("DOMContentLoaded", () => {
  // Inicializa o datalist de cidades
  CONFIG.preencherDatalist();

  const inputDistancia = document.getElementById("distancia");
  const checkboxManual = document.getElementById("manual-distancia");
  const inputOrigem = document.getElementById("origem");
  const inputDestino = document.getElementById("destino");

  // Cria dinamicamente uma tag pequena para exibir mensagens de ajuda/sucesso embaixo do input
  const helperText = document.createElement("small");
  helperText.style.display = "block";
  helperText.style.marginTop = "-1rem";
  helperText.style.marginBottom = "1.5rem";
  helperText.style.fontSize = "0.85rem";
  inputDistancia.parentNode.insertBefore(helperText, inputDistancia.nextSibling);

  /**
   * Função para atualizar o estado visual e interativo do campo de distância
   */
  function gerenciarEstadoDistancia() {
    if (checkboxManual.checked) {
      // Estado de escrita ativa
      inputDistancia.removeAttribute("readonly");
      inputDistancia.style.cursor = "text";
      inputDistancia.style.backgroundColor = "var(--color-neutral-white)";
      inputDistancia.style.borderColor = "var(--color-primary)";
      helperText.textContent = "Modo manual ativo. Digite a distância em km.";
      helperText.style.color = "var(--color-neutral-600)";
    } else {
      // Estado de leitura (Readonly)
      inputDistancia.setAttribute("readonly", true);
      inputDistancia.style.cursor = "not-allowed";
      inputDistancia.style.backgroundColor = "var(--color-info-disabled)";
      inputDistancia.style.borderColor = "var(--color-neutral-300)";
      
      // Verifica se já existe uma distância válida calculada pelas rotas
      atualizarDistanciaPorRota();
    }
  }

  /**
   * Tenta buscar a rota automática e atualiza o feedback visual do input
   */
  function atualizarDistanciaPorRota() {
    if (checkboxManual.checked) return;

    if (typeof rotasDB !== 'undefined' && inputOrigem.value && inputDestino.value) {
      const distanciaFicticia = rotasDB.findDistance(inputOrigem.value, inputDestino.value);

      if (distanciaFicticia !== null) {
        inputDistancia.value = distanciaFicticia;
        helperText.textContent = "✓ Distância encontrada automaticamente com sucesso!";
        helperText.style.color = "var(--color-primary)";
        inputDistancia.style.borderColor = "var(--color-primary-light)";
      } else {
        inputDistancia.value = "";
        helperText.textContent = "⚠ Rota não encontrada no sistema. Ative 'Inserir distância manualmente' acima.";
        helperText.style.color = "var(--color-alert-danger)";
        inputDistancia.style.borderColor = "var(--color-alert-danger)";
      }
    } else {
      // Reset inicial padrão
      inputDistancia.value = "";
      helperText.textContent = "A distância será calculada automaticamente com base na Origem e Destino.";
      helperText.style.color = "var(--color-neutral-600)";
      inputDistancia.style.borderColor = "var(--color-neutral-300)";
    }
  }

  // Ouvintes de eventos para atualizar o estado em tempo real
  checkboxManual.addEventListener("change", gerenciarEstadoDistancia);
  inputOrigem.addEventListener("input", atualizarDistanciaPorRota);
  inputDestino.addEventListener("input", atualizarDistanciaPorRota);

  // Executa o reset visual na inicialização
  gerenciarEstadoDistancia();
});