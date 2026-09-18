const menuToggle = document.getElementById("menu-toggle");
const menu = document.getElementById("menu-principal");
const linksMenu = menu.querySelectorAll("a");

menuToggle.addEventListener("click", () => {
  const menuAberto = menu.classList.toggle("ativo");

  menuToggle.setAttribute(
    "aria-expanded",
    menuAberto ? "true" : "false"
  );

  menuToggle.textContent = menuAberto ? "✕" : "☰";
});

linksMenu.forEach((link) => {
  link.addEventListener("click", () => {
    menu.classList.remove("ativo");

    menuToggle.setAttribute(
      "aria-expanded",
      "false"
    );

    menuToggle.textContent = "☰";
  });
});

window.addEventListener("resize", () => {
  if (window.innerWidth > 1000) {
    menu.classList.remove("ativo");

    menuToggle.setAttribute(
      "aria-expanded",
      "false"
    );

    menuToggle.textContent = "☰";
  }
});

// ======================================================
// AGENDAMENTO - ESPAÇO ESSENTIA
// ======================================================

const configuracaoAgendas = {
  psicologia: {
    // 0 = domingo, 1 = segunda, 2 = terça...
    diasPermitidos: [2, 4], // terça e quinta
    horarios: ["09:00", "11:00", "14:00", "16:00", "18:00"],
    whatsapp: "5583999999991"
  },

  nutricao: {
    diasPermitidos: [1, 3, 5], // segunda, quarta e sexta
    horarios: ["10:00", "14:00", "16:00"],
    whatsapp: "5583999999992"
  }
};


// ======================================================
// DATA DE HOJE
// ======================================================

function obterDataHoje() {
  const agora = new Date();

  const ano = agora.getFullYear();
  const mes = String(agora.getMonth() + 1).padStart(2, "0");
  const dia = String(agora.getDate()).padStart(2, "0");

  return `${ano}-${mes}-${dia}`;
}


// ======================================================
// CRIAR DATA LOCAL
// Evita problemas de fuso horário com input type="date"
// ======================================================

function criarDataLocal(dataString, horario = "00:00") {
  const [ano, mes, dia] = dataString.split("-").map(Number);
  const [hora, minuto] = horario.split(":").map(Number);

  return new Date(
    ano,
    mes - 1,
    dia,
    hora,
    minuto,
    0,
    0
  );
}


// ======================================================
// FORMATAÇÃO
// ======================================================

function formatarData(dataString) {
  const data = criarDataLocal(dataString);

  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "long",
    year: "numeric"
  }).format(data);
}


function formatarHorario(horario) {
  return horario.replace(":00", "h");
}


// ======================================================
// CONFIGURAR CADA FORMULÁRIO
// ======================================================

function configurarFormulario(tipo) {

  const config = configuracaoAgendas[tipo];

  const form = document.getElementById(`form-${tipo}`);
  const campoData = document.getElementById(`data-${tipo}`);
  const campoHorario = document.getElementById(`horario-${tipo}`);
  const mensagem = document.getElementById(`mensagem-${tipo}`);

  if (!form || !campoData || !campoHorario) {
    return;
  }


  // ----------------------------------------------------
  // NÃO PERMITIR DATA PASSADA
  // ----------------------------------------------------

  campoData.min = obterDataHoje();


  // ----------------------------------------------------
  // QUANDO A DATA FOR ALTERADA
  // ----------------------------------------------------

  campoData.addEventListener("change", () => {

    mensagem.textContent = "";

    campoHorario.innerHTML = `
      <option value="">
        Selecione um horário
      </option>
    `;

    campoHorario.disabled = true;

    if (!campoData.value) {
      return;
    }


    const dataSelecionada = criarDataLocal(campoData.value);
    const diaSemana = dataSelecionada.getDay();


    // --------------------------------------------------
    // VERIFICAR DIA DA SEMANA
    // --------------------------------------------------

    if (!config.diasPermitidos.includes(diaSemana)) {

      campoData.value = "";

      campoHorario.innerHTML = `
        <option value="">
          Dia indisponível
        </option>
      `;

      mensagem.textContent =
        tipo === "psicologia"
          ? "Psicologia atende somente às terças e quintas."
          : "Nutrição atende somente às segundas, quartas e sextas.";

      return;
    }


    // --------------------------------------------------
    // VERIFICAR HORÁRIOS DISPONÍVEIS
    // --------------------------------------------------

    const agora = new Date();

    let quantidadeDisponivel = 0;

    config.horarios.forEach((horario) => {

      const dataHoraConsulta = criarDataLocal(
        campoData.value,
        horario
      );


      // Mínimo de 1 hora de antecedência
      const limiteAntecedencia = new Date(
        agora.getTime() + (60 * 60 * 1000)
      );


      if (dataHoraConsulta <= limiteAntecedencia) {
        return;
      }


      const option = document.createElement("option");

      option.value = horario;
      option.textContent = formatarHorario(horario);

      campoHorario.appendChild(option);

      quantidadeDisponivel++;
    });


    // --------------------------------------------------
    // NENHUM HORÁRIO DISPONÍVEL
    // --------------------------------------------------

    if (quantidadeDisponivel === 0) {

      campoHorario.innerHTML = `
        <option value="">
          Nenhum horário disponível
        </option>
      `;

      mensagem.textContent =
        "Não existem mais horários disponíveis para esta data.";

      campoHorario.disabled = true;

      return;
    }


    campoHorario.disabled = false;

  });


  // ====================================================
  // ENVIO DO FORMULÁRIO
  // ====================================================

  form.addEventListener("submit", (event) => {

    event.preventDefault();

    mensagem.textContent = "";


    const modalidade =
      document.getElementById(`modalidade-${tipo}`).value;

    const nome =
      document.getElementById(`nome-${tipo}`).value.trim();

    const idade =
      document.getElementById(`idade-${tipo}`).value;

    const data =
      campoData.value;

    const horario =
      campoHorario.value;


    // --------------------------------------------------
    // VALIDAR CAMPOS
    // --------------------------------------------------

    if (
      !modalidade ||
      !nome ||
      !idade ||
      !data ||
      !horario
    ) {

      mensagem.textContent =
        "Preencha todos os campos para continuar.";

      return;
    }


    // --------------------------------------------------
    // VERIFICAR NOVAMENTE DIA E HORÁRIO
    // --------------------------------------------------

    const dataSelecionada = criarDataLocal(data);

    if (
      !config.diasPermitidos.includes(
        dataSelecionada.getDay()
      )
    ) {

      mensagem.textContent =
        "A data selecionada não está disponível.";

      return;
    }


    const dataHoraConsulta =
      criarDataLocal(data, horario);

    const agora = new Date();

    const limiteAntecedencia =
      new Date(
        agora.getTime() + (60 * 60 * 1000)
      );


    if (dataHoraConsulta <= limiteAntecedencia) {

      mensagem.textContent =
        "Este horário não está mais disponível. Escolha outro horário.";

      campoData.dispatchEvent(
        new Event("change")
      );

      return;
    }


    // --------------------------------------------------
    // MENSAGEM DE SUCESSO
    // --------------------------------------------------

    const dataFormatada =
      formatarData(data);

    const horarioFormatado =
      formatarHorario(horario);


    mensagem.innerHTML = `
      <strong>
        Solicitação de agendamento realizada com sucesso!
      </strong>
      <br>
      ${dataFormatada} às ${horarioFormatado}.
    `;


    // --------------------------------------------------
    // MENSAGEM WHATSAPP
    // --------------------------------------------------

    const profissional =
      tipo === "psicologia"
        ? "Psicologia"
        : "Nutrição";


    const textoWhatsApp =
`Olá! Vim pelo site do Espaço Essentia.

Gostaria de solicitar um agendamento.

Profissional: ${profissional}
Modalidade: ${modalidade}
Nome: ${nome}
Idade: ${idade} anos
Data: ${dataFormatada}
Horário: ${horarioFormatado}

Aguardo a confirmação do atendimento.`;


    const urlWhatsApp =
      `https://wa.me/${config.whatsapp}?text=${encodeURIComponent(textoWhatsApp)}`;


    // Pequeno tempo para mostrar a confirmação
    setTimeout(() => {

      window.open(
        urlWhatsApp,
        "_blank",
        "noopener,noreferrer"
      );

    }, 700);

  });

}


// ======================================================
// INICIAR AGENDAMENTOS
// ======================================================

configurarFormulario("psicologia");
configurarFormulario("nutricao");