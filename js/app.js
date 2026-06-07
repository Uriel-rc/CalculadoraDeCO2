/**
 * js/app.js
 * Arquivo principal de inicialização, captura de eventos e integração do sistema.
 */
(() => {
  // Executa apenas quando o DOM estiver completamente carregado
  document.addEventListener("DOMContentLoaded", () => {
    inicializar();
  });

  /**
   * 1. Inicialização do sistema
   */
  function inicializar() {
    // 1. Preenche o datalist de cidades para autocomplete (Método existente no CONFIG)
    if (typeof CONFIG !== 'undefined' && CONFIG.preencherDatalist) {
      CONFIG.preencherDatalist();
    }

    // 2. O gerenciamento de preenchimento automático da distância já foi ativado
    // nativamente no escopo de escuta do DOMContentLoaded dentro do próprio `config.js`.

    // 3. Captura o formulário pelo ID correspondente no HTML
    const form = document.getElementById("co2-form");

    if (form) {
      // 4. Adiciona o ouvinte para o evento de submit
      form.addEventListener("submit", manipularSubmit);
    }

    // 5. Log de inicialização bem-sucedida
    console.log("Calculadora iniciada com sucesso.");
  }

  /**
   * 2. Manipulador do evento de Submit
   */
  function manipularSubmit(event) {
    // Previne o comportamento padrão de recarregar a página
    event.preventDefault();

    // Captura os elementos do DOM
    const inputOrigem = document.getElementById("origem");
    const inputDestino = document.getElementById("destino");
    const inputDistancia = document.getElementById("distancia");
    const radioTransporte = document.querySelector('input[name="transporte"]:checked');

    // Resgata os valores reais digitados/selecionados
    const origem = inputOrigem ? inputOrigem.value.trim() : "";
    const destino = inputDestino ? inputDestino.value.trim() : "";
    const distanciaKm = inputDistancia ? parseFloat(inputDistancia.value) : 0;
    const meioTransporte = radioTransporte ? radioTransporte.value : "";

    // --- VALIDAÇÃO DOS INPUTS ---
    if (!origem || !destino) {
      alert("Por favor, preencha os campos de Origem e Destino.");
      return;
    }

    if (isNaN(distanciaKm) || distanciaKm <= 0) {
      alert("Por favor, insira uma distância válida e maior que 0 km. Se a rota automática falhar, selecione a opção 'Inserir distância manualmente'.");
      return;
    }

    if (!meioTransporte) {
      alert("Por favor, selecione um modo de transporte.");
      return;
    }

    // Altera temporariamente o texto do botão para dar feedback visual de carregamento
    const botaoSubmit = event.target.querySelector('button[type="submit"]');
    const textoBotaoOriginal = botaoSubmit.textContent;
    botaoSubmit.textContent = "Processando...";
    botaoSubmit.disabled = true;

    // Oculta resultados anteriores caso existam antes de renderizar os novos
    if (typeof UI !== 'undefined') {
      UI.hideElement("resultados");
      UI.hideElement("comparacao");
      UI.hideElement("creditos");
    }

    // --- SIMULAÇÃO DE PROCESSAMENTO (1500ms delay) ---
    setTimeout(() => {
      try {
        // Validação de segurança para garantir a existência dos módulos auxiliares
        if (typeof Calculadora === 'undefined' || typeof UI === 'undefined') {
          throw new Error("Módulos da Calculadora ou de Interface não foram carregados corretamente.");
        }

        // --- CÁLCULO DOS DADOS ---
        // 1. Calcula a emissão específica para a rota e meio escolhido
        const emissaoTotal = Calculadora.calcularEmissao(distanciaKm, meioTransporte);

        // 2. Gera a listagem comparativa entre todos os modos disponíveis
        const comparativoModos = Calculadora.calcularTodosModos(distanciaKm);

        // 3. Avalia o impacto financeiro e volume de créditos de carbono necessários
        const dadosCreditos = Calculadora.custoMedioCreditoCarbono(distanciaKm, meioTransporte);

        // --- RENDERIZAÇÃO NA INTERFACE ---
        // Renderiza os dados principais da viagem
        UI.renderizarResultados({
          origem: origem,
          destino: destino,
          distancia: distanciaKm,
          meioTransporte: meioTransporte,
          emissao: emissaoTotal
        });

        // Renderiza a tabela comparativa
        UI.renderizarComparacao(comparativoModos, meioTransporte);

        // Renderiza o painel de compensação ambiental
        UI.renderizarCreditosCarbono(dadosCreditos);

        // Rola a tela suavemente até a seção de resultados recém-exibida
        UI.scrollToElement("resultados");

      } catch (error) {
        console.error("Erro durante o processamento dos cálculos: ", error);
        alert("Ocorreu um erro interno ao processar os seus dados. Detalhes mapeados no console.");
      } finally {
        // Restaura o estado original do botão de envio
        botaoSubmit.textContent = textoBotaoOriginal;
        botaoSubmit.disabled = false;
      }
    }, 1500);
  }
})();