/**
 * js/ui.js
 * Gerenciamento de interface, formatações e renderização de dados da calculadora.
 */

const UI = {
  /**
   * Formata um número adicionando separadores de milhar e decimais fixos.
   */
  formatarNumero: function(numero, decimais = 2) {
    if (isNaN(numero) || numero === null) return "0";
    
    // Fixa as casas decimais conforme solicitado
    const numeroFixado = parseFloat(numero).toFixed(decimais);
    
    // Separa a parte inteira da decimal para aplicar a formatação brasileira
    const partes = numeroFixado.split('.');
    partes[0] = partes[0].replace(/\B(?=(\d{3})+(?!\d))/g, ".");
    
    return partes.length > 1 ? partes.join(',') : partes[0];
  },

  /**
   * Formata um valor numérico para o padrão de moeda brasileiro (R$).
   */
  formatarMoeda: function(valor) {
    if (isNaN(valor) || valor === null) return "R$ 0,00";
    return "R$ " + this.formatarNumero(valor, 2);
  },

  /**
   * Remove a classe 'hidden' de um elemento para torná-lo visível.
   */
  showElement: function(elementId) {
    const elemento = document.getElementById(elementId);
    if (elemento) {
      elemento.classList.remove("hidden");
    }
  },

  /**
   * Adiciona a classe 'hidden' a um elemento para ocultá-lo.
   */
  hideElement: function(elementId) {
    const elemento = document.getElementById(elementId);
    if (elemento) {
      elemento.classList.add("hidden");
    }
  },

  /**
   * Rola a tela de forma suave até o elemento especificado.
   */
  scrollToElement: function(elementId) {
    const elemento = document.getElementById(elementId);
    if (elemento) {
      elemento.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  },

  /**
   * Renderiza a seção de resultados principais da rota e meio selecionado.
   */
  renderizarResultados: function(data) {
    const container = document.getElementById("resultado-emissao");
    if (!container) return;

    // Recupera os metadados do modo de transporte (ícone, label, cor) salvos no CONFIG
    const metaModo = CONFIG.modos_de_transporte[data.meioTransporte] || { label: data.meioTransporte, icone: "🔹" };

    container.innerHTML = `
      <div class="results-section__info">
        <p><strong>Origem:</strong> ${data.origem}</p>
        <p><strong>Destino:</strong> ${data.destino}</p>
        <p><strong>Distância Total:</strong> ${this.formatarNumero(data.distancia, 1)} km</p>
        <p><strong>Modo Escolhido:</strong> ${metaModo.icone} ${metaModo.label}</p>
      </div>
      <div class="results-section__highlight" style="margin-top: 1.5rem; padding: 1rem; background-color: var(--color-neutral-100); border-radius: var(--radius-small); text-align: center;">
        <span style="font-size: 1.2rem;">Pegada de Carbono Estimada:</span>
        <div class="text-danger" style="font-size: 2rem; margin: 0.5rem 0;">
          ${this.formatarNumero(data.emissao, 2)} <span style="font-size: 1.2rem;">kg de CO²</span>
        </div>
      </div>
    `;

    this.showElement("resultados");
  },

  /**
   * Renderiza a tabela comparativa contendo todos os modos de transporte disponíveis.
   */
  renderizarComparacao: function(resultadosModos, modoSelecionado) {
    const container = document.getElementById("resultado-comparacao");
    if (!container) return;

    let tabelaHtml = `
      <p style="margin-bottom: 1rem;">Veja como o seu meio de transporte se compara aos demais para esta mesma distância:</p>
      <div style="overflow-x: auto;">
        <table style="width: 100%; border-collapse: collapse; text-align: left; font-size: 1rem;">
          <thead>
            <tr style="border-bottom: 2px solid var(--color-neutral-300); background-color: var(--color-neutral-100);">
              <th style="padding: 0.75rem;">Modo</th>
              <th style="padding: 0.75rem; text-align: right;">Emissão (kg CO²)</th>
              <th style="padding: 0.75rem; text-align: right;">Economia vs Carro</th>
            </tr>
          </thead>
          <tbody>
    `;

    resultadosModos.forEach(item => {
      const meta = CONFIG.modos_de_transporte[item.modo] || { label: item.modo, icone: "🔹" };
      
      // Destaca visualmente a linha que corresponde ao transporte que o usuário utilizou
      const linhaDestaque = item.modo === modoSelecionado 
        ? `style="background-color: var(--color-primary-light); font-weight: bold;"` 
        : `style="border-bottom: 1px solid var(--color-neutral-300); "`;

      // Define a cor do texto de economia baseado no valor
      let classeCorEconomia = "text-success";
      if (item.porcentagemEconomia < 0) {
        classeCorEconomia = "text-danger";
      } else if (item.porcentagemEconomia === 0 && item.modo === 'carro') {
        classeCorEconomia = ""; // Neutro para o próprio carro
      }

      let textoEconomia = item.porcentagemEconomia > 0 ? `+${this.formatarNumero(item.porcentagemEconomia, 2)}%` : `${this.formatarNumero(item.porcentagemEconomia, 2)}%`;
      if (item.modo === 'carro') textoEconomia = "Referência";

      tabelaHtml += `
        <tr ${linhaDestaque}>
          <td style="padding: 0.75rem;">${meta.icone} ${meta.label} ${item.modo === modoSelecionado ? ' (Seu Modo)' : ''}</td>
          <td style="padding: 0.75rem; text-align: right;">${this.formatarNumero(item.emissao, 2)}</td>
          <td style="padding: 0.75rem; text-align: right;" class="${classeCorEconomia}">${textoEconomia}</td>
        </tr>
      `;
    });

    tabelaHtml += `
          </tbody>
        </table>
      </div>
    `;

    container.innerHTML = tabelaHtml;
    this.showElement("comparacao");
  },

  /**
   * Renderiza a análise financeira e volumétrica de Créditos de Carbono necessários para a compensação.
   */
  renderizarCreditosCarbono: function(dadosCreditos) {
    const container = document.getElementById("resultado-creditos");
    if (!container) return;

    if (dadosCreditos.emissaoKg === 0) {
      container.innerHTML = `
        <div style="padding: 1rem; background-color: var(--color-primary-light); border-radius: var(--radius-small); color: var(--color-primary-dark);">
          🌱 <strong>Emissão Zero!</strong> Parabéns, sua viagem não gerou emissões de CO² e não necessita de compensação financeira ambiental.
        </div>
      `;
    } else {
      container.innerHTML = `
        <p style="margin-bottom: 1rem;">Para neutralizar o impacto ambiental da sua viagem, você pode apoiar projetos certificados de reflorestamento ou energia limpa:</p>
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; margin-top: 1rem;">
          <div style="padding: 1rem; background-color: var(--color-neutral-100); border-radius: var(--radius-small);">
            <small style="color: var(--color-neutral-600); display: block;">Créditos Fracionados</small>
            <strong style="font-size: 1.2rem;">${this.formatarNumero(dadosCreditos.creditosExatos, 4)}</strong> <small>U.C.*</small>
          </div>
          <div style="padding: 1rem; background-color: var(--color-neutral-100); border-radius: var(--radius-small);">
            <small style="color: var(--color-neutral-600); display: block;">Compra Mínima Comercial</small>
            <strong style="font-size: 1.2rem;">${dadosCreditos.creditosMinimosInteiros}</strong> <small>Crédito(s) Inteiro(s)</small>
          </div>
        </div>
        <div style="margin-top: 1.5rem; padding: 1rem; border-left: 4px solid var(--color-primary); background-color: rgba(30, 189, 100, 0.05);">
          <p><strong>Custo Médio de Compensação Proporcional:</strong></p>
          <span class="text-success" style="font-size: 1.5rem;">${this.formatarMoeda(dadosCreditos.custoMedioBrl)}</span>
          <p style="font-size: 0.8rem; color: var(--color-neutral-600); margin-top: 0.5rem;">* 1 Unidade de Crédito (U.C.) equivale a 1.000 kg (1 tonelada) de CO² evitado.</p>
        </div>
      `;
    }

    this.showElement("creditos");
  }
};