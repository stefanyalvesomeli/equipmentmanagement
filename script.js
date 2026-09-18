/* =========================================================
   SISTEMA DE CONTROLE DE EQUIPAMENTOS
   script.js
   ========================================================= */


/* =========================================================
   SUPABASE
   ========================================================= */

const SUPABASE_URL =
  "https://ytnvsoodbzmjsaxkqqcg.supabase.co";

const SUPABASE_KEY =
  "sb_publishable_zLb9jjLBuyhZFwCVZZGz9Q_kplzXoYd";

const supabaseClient =
  window.supabase.createClient(
    SUPABASE_URL,
    SUPABASE_KEY
  );


/* =========================================================
   CONFIGURAÇÕES
   ========================================================= */

const tipos = [
  "hh",
  "notebook",
  "radio",
  "carregador",
  "doisD",
  "impressora"
];

const nomesTipos = {
  hh: "HH",
  notebook: "Notebook",
  radio: "Rádio",
  carregador: "Carregador",
  doisD: "2D",
  impressora: "Impressora portátil"
};

const POR_PAGINA = 20;


/* =========================================================
   DADOS
   ========================================================= */

let dados = {
  hh: [],
  notebook: [],
  radio: [],
  carregador: [],
  doisD: [],
  impressora: [],
  quebrados: []
};

let paginas = {
  hh: 1,
  notebook: 1,
  radio: 1,
  carregador: 1,
  doisD: 1,
  impressora: 1,
  quebrados: 1
};


/* =========================================================
   UTILIDADES
   ========================================================= */

function gerarId() {

  return (
    Date.now().toString() +
    Math.random()
      .toString(16)
      .slice(2)
  );

}


function dataHoraAtual() {

  const agora = new Date();

  const ano =
    agora.getFullYear();

  const mes =
    String(
      agora.getMonth() + 1
    ).padStart(2, "0");

  const dia =
    String(
      agora.getDate()
    ).padStart(2, "0");

  const hora =
    String(
      agora.getHours()
    ).padStart(2, "0");

  const minuto =
    String(
      agora.getMinutes()
    ).padStart(2, "0");

  const segundo =
    String(
      agora.getSeconds()
    ).padStart(2, "0");

  return {
    data: `${ano}-${mes}-${dia}`,
    hora: `${hora}:${minuto}:${segundo}`
  };

}


function formatarData(data) {

  if (!data) {
    return "-";
  }

  const partes =
    String(data).split("-");

  if (partes.length !== 3) {
    return data;
  }

  return (
    `${partes[2]}/${partes[1]}/${partes[0]}`
  );

}


function escapeHTML(texto) {

  if (
    texto === null ||
    texto === undefined
  ) {
    return "";
  }

  return String(texto)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}


function escapeJS(texto) {

  if (
    texto === null ||
    texto === undefined
  ) {
    return "";
  }

  return String(texto)
    .replace(/\\/g, "\\\\")
    .replace(/'/g, "\\'")
    .replace(/"/g, '\\"')
    .replace(/\r/g, "\\r")
    .replace(/\n/g, "\\n");
}


function mostrarAlerta(
  tipo,
  mensagem
) {

  const elemento =
    document.getElementById(
      "alert-" + tipo
    );

  if (!elemento) {
    return;
  }

  elemento.className =
    "alert show success";

  elemento.textContent =
    mensagem;

  setTimeout(
    function () {

      elemento.className =
        "alert";

    },
    3000
  );

}


function limparForm(tipo) {

  const form =
    document.getElementById(
      "form-" + tipo
    );

  if (form) {
    form.reset();
  }

}


/* =========================================================
   CONVERSÃO DO SUPABASE
   ========================================================= */

function converterRegistro(row) {

  return {

    id:
      String(row.id),

    tipo:
      row.tipo || "",

    codigo:
      row.codigo || "",

    nome:
      row.nome || "",

    funcao:
      row.funcao || "",

    status:
      row.status || "Funcionando",

    observacao:
      row.observacao || "",

    criadoEm: {

      data:
        row.criado_em
          ? String(row.criado_em).substring(0, 10)
          : "",

      hora:
        row.criado_em
          ? String(row.criado_em).substring(11, 19)
          : ""

    },

    quebradoEm:

      row.quebrado_data

        ? {

            data:
              row.quebrado_data,

            hora:
              row.quebrado_hora
                ? String(
                    row.quebrado_hora
                  ).substring(0, 8)
                : "",

            observacao:
              row.quebrado_observacao ||
              row.observacao ||
              ""

          }

        : null

  };

}


function converterQuebrado(row) {

  return {

    id:
      String(row.id),

    nome:
      row.nome || "",

    quantidade:
      Number(row.quantidade || 1),

    observacao:
      row.observacao || "",

    criadoEm: {

      data:
        row.criado_em
          ? String(
              row.criado_em
            ).substring(0, 10)
          : "",

      hora:
        row.criado_em
          ? String(
              row.criado_em
            ).substring(11, 19)
          : ""

    }

  };

}


/* =========================================================
   CARREGAR EQUIPAMENTOS
   ========================================================= */

async function carregarEquipamentos() {

  const {
    data,
    error
  } =
    await supabaseClient
      .from("equipamentos")
      .select("*")
      .order(
        "criado_em",
        {
          ascending: false
        }
      );

  if (error) {
    throw error;
  }

  const novasDados = {

    hh: [],
    notebook: [],
    radio: [],
    carregador: [],
    doisD: [],
    impressora: []

  };


  (data || []).forEach(
    function (row) {

      if (
        tipos.includes(
          row.tipo
        )
      ) {

        novasDados[row.tipo].push(
          converterRegistro(row)
        );

      }

    }
  );


  tipos.forEach(
    function (tipo) {

      dados[tipo] =
        novasDados[tipo];

    }
  );

}


/* =========================================================
   CARREGAR QUEBRADOS MANUAIS
   ========================================================= */

async function carregarQuebrados() {

  const {
    data,
    error
  } =
    await supabaseClient
      .from("quebrados")
      .select("*")
      .order(
        "criado_em",
        {
          ascending: false
        }
      );

  if (error) {
    throw error;
  }

  dados.quebrados =
    (data || []).map(
      function (row) {

        return converterQuebrado(
          row
        );

      }
    );

}


/* =========================================================
   CARREGAR TODOS OS DADOS
   ========================================================= */

async function carregarDados(
  mostrarErro = true
) {

  try {

    await Promise.all([
      carregarEquipamentos(),
      carregarQuebrados()
    ]);


    atualizarDashboard();

    preencherAnos();


    /*
     * Atualiza apenas a página que está aberta.
     */

    const paginaAtiva =
      document.querySelector(
        ".page.active"
      );


    if (
      paginaAtiva
    ) {

      const id =
        paginaAtiva.id;


      if (
        tipos.includes(id)
      ) {

        renderPage(id);

      }


      if (
        id === "quebrados"
      ) {

        renderBroken();

      }

    }

  } catch (error) {

    console.error(
      "Erro ao carregar dados:",
      error
    );


    if (mostrarErro) {

      alert(
        "Não foi possível carregar os dados do banco de dados.\n\n" +
        (
          error.message ||
          "Verifique sua conexão."
        )
      );

    }


    throw error;

  }

}


/* =========================================================
   DASHBOARD
   ========================================================= */

function atualizarDashboard() {

  const totalHH =
    dados.hh.length;

  const totalNotebook =
    dados.notebook.length;

  const totalRadio =
    dados.radio.length;

  const totalCarregador =
    dados.carregador.length;

  const totalDoisD =
    dados.doisD.length;

  const totalImpressora =
    dados.impressora.length;


  let totalQuebrados = 0;


  tipos.forEach(
    function (tipo) {

      totalQuebrados +=
        dados[tipo].filter(
          function (item) {

            return (
              item.status ===
              "Quebrado"
            );

          }
        ).length;

    }
  );


  if (
    Array.isArray(
      dados.quebrados
    )
  ) {

    dados.quebrados.forEach(
      function (item) {

        totalQuebrados +=
          Number(
            item.quantidade || 1
          );

      }
    );

  }


  atualizarNumero(
    "totalHH",
    totalHH
  );

  atualizarNumero(
    "totalNotebook",
    totalNotebook
  );

  atualizarNumero(
    "totalRadio",
    totalRadio
  );

  atualizarNumero(
    "totalCarregador",
    totalCarregador
  );

  atualizarNumero(
    "totalDoisD",
    totalDoisD
  );

  atualizarNumero(
    "total2D",
    totalDoisD
  );

  atualizarNumero(
    "totalImpressora",
    totalImpressora
  );

  atualizarNumero(
    "totalQuebrados",
    totalQuebrados
  );


  atualizarNumero(
    "totalEquipamentos",
    totalHH +
    totalNotebook +
    totalRadio +
    totalCarregador +
    totalDoisD +
    totalImpressora
  );


  atualizarDashboardQuebrados();

}


function atualizarNumero(
  id,
  valor
) {

  const elemento =
    document.getElementById(id);

  if (elemento) {

    elemento.textContent =
      valor;

  }

}


/* =========================================================
   CONTAGEM DE QUEBRADOS POR TIPO
   ========================================================= */

function atualizarDashboardQuebrados() {

  const contagens = {

    hh: 0,
    notebook: 0,
    radio: 0,
    carregador: 0,
    doisD: 0,
    impressora: 0,
    gatilhos: 0

  };


  tipos.forEach(
    function (tipo) {

      const lista =
        Array.isArray(
          dados[tipo]
        )
          ? dados[tipo]
          : [];


      lista.forEach(
        function (item) {

          if (
            item.status ===
            "Quebrado"
          ) {

            contagens[tipo]++;

          }

        }
      );

    }
  );


  if (
    Array.isArray(
      dados.quebrados
    )
  ) {

    dados.quebrados.forEach(
      function (item) {

        const nome =
          String(
            item.nome || ""
          )
            .toLowerCase()
            .normalize("NFD")
            .replace(
              /[\u0300-\u036f]/g,
              ""
            )
            .trim();


        const quantidade =
          Number(
            item.quantidade || 1
          );


        if (
          nome === "hh" ||
          nome.includes("handheld")
        ) {

          contagens.hh +=
            quantidade;

        }

        else if (
          nome.includes("notebook")
        ) {

          contagens.notebook +=
            quantidade;

        }

        else if (
          nome.includes("radio")
        ) {

          contagens.radio +=
            quantidade;

        }

        else if (
          nome.includes("carregador")
        ) {

          contagens.carregador +=
            quantidade;

        }

        else if (
          nome === "2d" ||
          nome.includes("2d")
        ) {

          contagens.doisD +=
            quantidade;

        }

        else if (
          nome.includes("impressora")
        ) {

          contagens.impressora +=
            quantidade;

        }

     
    );

  }


  atualizarNumero(
    "quebradosHH",
    contagens.hh
  );

  atualizarNumero(
    "quebradosNotebook",
    contagens.notebook
  );

  atualizarNumero(
    "quebradosRadio",
    contagens.radio
  );

  atualizarNumero(
    "quebradosCarregador",
    contagens.carregador
  );

  atualizarNumero(
    "quebrados2D",
    contagens.doisD
  );

  atualizarNumero(
    "quebradosImpressora",
    contagens.impressora
  );


}


/* =========================================================
   NAVEGAÇÃO
   ========================================================= */

function showPage(
  pageId,
  button
) {

  document
    .querySelectorAll(".page")
    .forEach(
      function (page) {

        page.classList.remove(
          "active"
        );

      }
    );


  const pagina =
    document.getElementById(
      pageId
    );


  if (pagina) {

    pagina.classList.add(
      "active"
    );

  }


  document
    .querySelectorAll(".nav-btn")
    .forEach(
      function (btn) {

        btn.classList.remove(
          "active"
        );

      }
    );


  if (button) {

    button.classList.add(
      "active"
    );

  }


  const sidebar =
    document.getElementById(
      "sidebar"
    );


  if (sidebar) {

    sidebar.classList.remove(
      "open"
    );

  }


  if (
    pageId === "dashboard"
  ) {

    atualizarDashboard();

  }


  if (
    tipos.includes(pageId)
  ) {

    if (
      !paginas[pageId]
    ) {

      paginas[pageId] =
        1;

    }

    renderPage(pageId);

  }


  if (
    pageId === "quebrados"
  ) {

    paginas.quebrados =
      1;

    preencherAnos();

    renderBroken();

  }


  window.scrollTo({
    top: 0,
    behavior: "smooth"
  });

}


function toggleMenu() {

  const sidebar =
    document.getElementById(
      "sidebar"
    );

  if (!sidebar) {
    return;
  }

  sidebar.classList.toggle(
    "open"
  );

}


/* =========================================================
   CADASTRAR EQUIPAMENTO
   ========================================================= */

async function adicionarEquipamento(
  tipo
) {

  if (
    !tipos.includes(tipo)
  ) {

    alert(
      "Tipo de equipamento inválido."
    );

    return;

  }


  const codigoInput =
    document.getElementById(
      tipo + "-codigo"
    );

  const nomeInput =
    document.getElementById(
      tipo + "-nome"
    );

  const statusInput =
    document.getElementById(
      tipo + "-status"
    );

  const observacaoInput =
    document.getElementById(
      tipo + "-observacao"
    );


  if (
    !codigoInput ||
    !nomeInput ||
    !statusInput ||
    !observacaoInput
  ) {

    alert(
      "Não foi possível localizar os campos do formulário."
    );

    return;

  }


  const codigo =
    codigoInput.value.trim();

  const nome =
    nomeInput.value.trim();

  const status =
    statusInput.value;

  const observacao =
    observacaoInput.value.trim();


  let funcao = "";


  if (
    tipo === "notebook"
  ) {

    const funcaoInput =
      document.getElementById(
        "notebook-funcao"
      );

    if (funcaoInput) {

      funcao =
        funcaoInput.value.trim();

    }

  }


  if (!codigo) {

    alert(
      "Preencha o código do equipamento."
    );

    codigoInput.focus();

    return;

  }


  if (!nome) {

    alert(
      "Preencha o nome."
    );

    nomeInput.focus();

    return;

  }


  try {

    const {
      data: existente,
      error: erroBusca
    } =
      await supabaseClient
        .from("equipamentos")
        .select("id")
        .eq(
          "codigo",
          codigo
        )
        .maybeSingle();


    if (erroBusca) {
      throw erroBusca;
    }


    if (existente) {

      alert(
        "Já existe um equipamento cadastrado com este código."
      );

      codigoInput.focus();

      return;

    }


    const quebra =
      status === "Quebrado"
        ? dataHoraAtual()
        : null;


    const registro = {

      tipo:
        tipo,

      codigo:
        codigo,

      nome:
        nome,

      funcao:
        tipo === "notebook"
          ? funcao || null
          : null,

      observacao:
        observacao || null,

      status:
        status,

      quebrado_data:
        quebra
          ? quebra.data
          : null,

      quebrado_hora:
        quebra
          ? quebra.hora
          : null,

      quebrado_observacao:
        quebra
          ? observacao || null
          : null

    };


    const {
      error
    } =
      await supabaseClient
        .from("equipamentos")
        .insert([
          registro
        ]);


    if (error) {
      throw error;
    }


    limparForm(tipo);

    paginas[tipo] = 1;


    await carregarDados();


    mostrarAlerta(
      tipo,
      "Equipamento cadastrado com sucesso!"
    );


    if (
      status === "Quebrado"
    ) {

      alert(
        "Equipamento registrado como QUEBRADO.\n\n" +
        "A data e a hora da quebra foram registradas automaticamente."
      );

    }

  } catch (error) {

    console.error(
      "Erro ao cadastrar equipamento:",
      error
    );

    alert(
      "Erro ao cadastrar equipamento no banco de dados.\n\n" +
      (
        error.message ||
        "Verifique sua conexão."
      )
    );

  }

}


/* =========================================================
   CADASTRAR REGISTRO MANUAL DE QUEBRADO
   ========================================================= */

async function adicionarQuebrado() {

  const nomeInput =
    document.getElementById(
      "quebrado-nome"
    );

  const quantidadeInput =
    document.getElementById(
      "quebrado-quantidade"
    );

  const observacaoInput =
    document.getElementById(
      "quebrado-observacao"
    );


  if (
    !nomeInput ||
    !quantidadeInput ||
    !observacaoInput
  ) {

    alert(
      "Não foi possível localizar os campos de quebrados."
    );

    return;

  }


  const nome =
    nomeInput.value.trim();

  const quantidade =
    Number(
      quantidadeInput.value
    );

  const observacao =
    observacaoInput.value.trim();


  if (!nome) {

    alert(
      "Informe o nome do equipamento."
    );

    nomeInput.focus();

    return;

  }


  if (
    !Number.isFinite(quantidade) ||
    quantidade < 1
  ) {

    alert(
      "Informe uma quantidade válida."
    );

    quantidadeInput.focus();

    return;

  }


  try {

    const {
      error
    } =
      await supabaseClient
        .from("quebrados")
        .insert([
          {
            nome: nome,
            quantidade: quantidade,
            observacao:
              observacao || null
          }
        ]);


    if (error) {
      throw error;
    }


    const form =
      document.getElementById(
        "form-quebrados"
      );


    if (form) {
      form.reset();
    }


    quantidadeInput.value =
      "1";


    paginas.quebrados =
      1;


    await carregarDados();


    alert(
      "Equipamento quebrado registrado com sucesso!"
    );

  } catch (error) {

    console.error(
      "Erro ao cadastrar quebrado:",
      error
    );

    alert(
      "Não foi possível registrar o equipamento quebrado.\n\n" +
      (
        error.message ||
        "Verifique sua conexão com o banco de dados."
      )
    );

  }

}


/* =========================================================
   FORMULÁRIOS
   ========================================================= */

function registrarEventosFormularios() {

  tipos.forEach(
    function (tipo) {

      const form =
        document.getElementById(
          "form-" + tipo
        );


      if (!form) {
        return;
      }


      form.addEventListener(
        "submit",
        async function (event) {

          event.preventDefault();

          await adicionarEquipamento(
            tipo
          );

        }
      );

    }
  );


  const formQuebrados =
    document.getElementById(
      "form-quebrados"
    );


  if (formQuebrados) {

    formQuebrados.addEventListener(
      "submit",
      async function (event) {

        event.preventDefault();

        await adicionarQuebrado();

      }
    );

  }

}


/* =========================================================
   BUSCA DOS EQUIPAMENTOS
   ========================================================= */

function obterBusca(
  tipo
) {

  const input =
    document.getElementById(
      "busca-" + tipo
    );


  if (!input) {
    return "";
  }


  return input.value
    .trim()
    .toLowerCase();

}


function filtrarDados(
  tipo
) {

  const lista =
    Array.isArray(
      dados[tipo]
    )
      ? dados[tipo]
      : [];


  const busca =
    obterBusca(tipo);


  if (!busca) {

    return [
      ...lista
    ];

  }


  return lista.filter(
    function (item) {

      const codigo =
        String(
          item.codigo || ""
        ).toLowerCase();

      const nome =
        String(
          item.nome || ""
        ).toLowerCase();

      const observacao =
        String(
          item.observacao ||
          item.quebradoEm?.observacao ||
          ""
        ).toLowerCase();


      return (
        codigo.includes(busca) ||
        nome.includes(busca) ||
        observacao.includes(busca)
      );

    }
  );

}


/* =========================================================
   RENDERIZAR EQUIPAMENTOS
   ========================================================= */

function renderPage(
  tipo
) {

  const container =
    document.getElementById(
      "tabela-" + tipo
    );


  if (!container) {
    return;
  }


  const lista =
    filtrarDados(tipo);


  const totalPaginas =
    Math.max(
      1,
      Math.ceil(
        lista.length /
        POR_PAGINA
      )
    );


  paginas[tipo] =
    Math.max(
      1,
      Math.min(
        paginas[tipo] || 1,
        totalPaginas
      )
    );


  const inicio =
    (
      paginas[tipo] - 1
    ) *
    POR_PAGINA;


  const pagina =
    lista.slice(
      inicio,
      inicio + POR_PAGINA
    );


  if (
    pagina.length === 0
  ) {

    container.innerHTML = `
      <div class="empty">
        Nenhum equipamento encontrado.
      </div>
    `;

    return;

  }


  let html = `

    <div class="table-container">

      <table>

        <thead>

          <tr>

            <th>Código</th>

            <th>Nome</th>

            ${
              tipo === "notebook"
                ? `<th>Função</th>`
                : ""
            }

            <th>Status</th>

            <th>Observação</th>

            <th>Ações</th>

          </tr>

        </thead>

        <tbody>

  `;


  pagina.forEach(
    function (item) {

      html += `

        <tr>

          <td>
            <strong>
              ${escapeHTML(item.codigo)}
            </strong>
          </td>

          <td>
            ${escapeHTML(item.nome)}
          </td>

          ${
            tipo === "notebook"
              ? `
                <td>
                  ${escapeHTML(
                    item.funcao || "-"
                  )}
                </td>
              `
              : ""
          }

          <td>

            <span class="status ${
              item.status === "Quebrado"
                ? "status-broken"
                : "status-ok"
            }">

              ${escapeHTML(
                item.status ||
                "Funcionando"
              )}

            </span>

          </td>

          <td>
            ${escapeHTML(
              item.observacao || "-"
            )}
          </td>

          <td>

            <div class="table-actions">

              <button
                type="button"
                class="edit-btn"
                onclick="editarEquipamento(
                  '${escapeJS(tipo)}',
                  '${escapeJS(item.id)}',
                  ${
                    item.status === "Quebrado"
                      ? "true"
                      : "false"
                  }
                )"
              >
                ✏️ Editar
              </button>

              <button
                type="button"
                class="delete-btn"
                onclick="excluirEquipamento(
                  '${escapeJS(tipo)}',
                  '${escapeJS(item.id)}',
                  false
                )"
              >
                🗑️ Excluir
              </button>

            </div>

          </td>

        </tr>

      `;

    }
  );


  html += `

        </tbody>

      </table>

    </div>

  `;


  html += criarPaginacao(
    tipo,
    totalPaginas,
    paginas[tipo],
    "normal"
  );


  container.innerHTML =
    html;

}


/* =========================================================
   PAGINAÇÃO
   ========================================================= */

function criarPaginacao(
  tipo,
  total,
  atual,
  modo
) {

  if (total <= 1) {
    return "";
  }


  let html =
    `<div class="pagination">`;


  html += `

    <button
      type="button"
      class="pagination-prev"
      onclick="mudarPagina(
        '${escapeJS(tipo)}',
        ${atual - 1},
        '${escapeJS(modo)}'
      )"
      ${atual === 1 ? "disabled" : ""}
    >
      ← Anterior
    </button>

  `;


  const paginasExibir = [];


  function adicionarPagina(
    numero
  ) {

    if (
      !paginasExibir.includes(
        numero
      )
    ) {

      paginasExibir.push(
        numero
      );

    }

  }


  adicionarPagina(1);


  for (
    let i = atual - 2;
    i <= atual + 2;
    i++
  ) {

    if (
      i > 1 &&
      i < total
    ) {

      adicionarPagina(i);

    }

  }


  if (total > 1) {
    adicionarPagina(total);
  }


  paginasExibir.sort(
    function (a, b) {
      return a - b;
    }
  );


  let paginaAnterior =
    null;


  paginasExibir.forEach(
    function (numero) {

      if (
        paginaAnterior !== null &&
        numero >
          paginaAnterior + 1
      ) {

        html += `
          <span class="pagination-dots">
            ...
          </span>
        `;

      }


      html += `

        <button
          type="button"
          class="${
            numero === atual
              ? "active"
              : ""
          }"
          onclick="mudarPagina(
            '${escapeJS(tipo)}',
            ${numero},
            '${escapeJS(modo)}'
          )"
        >
          ${numero}
        </button>

      `;


      paginaAnterior =
        numero;

    }
  );


  html += `

    <button
      type="button"
      class="pagination-next"
      onclick="mudarPagina(
        '${escapeJS(tipo)}',
        ${atual + 1},
        '${escapeJS(modo)}'
      )"
      ${atual === total ? "disabled" : ""}
    >
      Próxima →
    </button>

  `;


  html +=
    `</div>`;


  return html;

}


function mudarPagina(
  tipo,
  pagina,
  modo
) {

  pagina =
    Number(pagina);


  if (
    !Number.isFinite(pagina)
  ) {

    pagina = 1;

  }


  pagina =
    Math.floor(pagina);


  if (
    modo === "broken"
  ) {

    const lista =
      filtrarQuebrados();


    const totalPaginas =
      Math.max(
        1,
        Math.ceil(
          lista.length /
          POR_PAGINA
        )
      );


    paginas.quebrados =
      Math.max(
        1,
        Math.min(
          pagina,
          totalPaginas
        )
      );


    renderBroken();

    return;

  }


  const lista =
    filtrarDados(tipo);


  const totalPaginas =
    Math.max(
      1,
      Math.ceil(
        lista.length /
        POR_PAGINA
      )
    );


  paginas[tipo] =
    Math.max(
      1,
      Math.min(
        pagina,
        totalPaginas
      )
    );


  renderPage(tipo);

}


/* =========================================================
   EDITAR EQUIPAMENTO
   ========================================================= */

async function editarEquipamento(
  tipo,
  id,
  editarQuebra = false
) {

  const item =
    dados[tipo]?.find(
      function (equipamento) {

        return (
          String(
            equipamento.id
          ) ===
          String(id)
        );

      }
    );


  if (!item) {

    alert(
      "Equipamento não encontrado."
    );

    return;

  }


  const estaQuebrado =
    item.status === "Quebrado";


  const mostrarDadosQuebra =
    estaQuebrado ||
    editarQuebra;


  let html = `

    <form id="form-edicao">

      <div class="form-grid">

        <div class="form-group">

          <label>Código</label>

          <input
            id="edit-codigo"
            value="${escapeHTML(
              item.codigo
            )}"
            required
          >

        </div>

        <div class="form-group">

          <label>Nome</label>

          <input
            id="edit-nome"
            value="${escapeHTML(
              item.nome
            )}"
            required
          >

        </div>

  `;


  if (
    tipo === "notebook"
  ) {

    html += `

      <div class="form-group">

        <label>Função</label>

        <input
          id="edit-funcao"
          value="${escapeHTML(
            item.funcao || ""
          )}"
        >

      </div>

    `;

  }


  html += `

        <div class="form-group">

          <label>Status</label>

          <select id="edit-status">

            <option
              value="Funcionando"
              ${
                item.status === "Funcionando"
                  ? "selected"
                  : ""
              }
            >
              Funcionando
            </option>

            <option
              value="Quebrado"
              ${
                item.status === "Quebrado"
                  ? "selected"
                  : ""
              }
            >
              Quebrado
            </option>

          </select>

        </div>


        <div class="form-group full">

          <label>Observação</label>

          <textarea
            id="edit-observacao"
          >${escapeHTML(
            item.observacao || ""
          )}</textarea>

        </div>

  `;


  if (
    mostrarDadosQuebra
  ) {

    html += `

        <div class="form-group">

          <label>
            Data da quebra
          </label>

          <input
            type="date"
            id="edit-quebrado-data"
            value="${
              item.quebradoEm?.data || ""
            }"
          >

        </div>


        <div class="form-group">

          <label>
            Hora da quebra
          </label>

          <input
            type="time"
            id="edit-quebrado-hora"
            value="${
              item.quebradoEm?.hora
                ? item.quebradoEm.hora.substring(
                    0,
                    5
                  )
                : ""
            }"
          >

        </div>


        <div class="form-group full">

          <label>
            Observação da quebra
          </label>

          <textarea
            id="edit-quebrado-observacao"
          >${escapeHTML(
            item.quebradoEm?.observacao ||
            item.observacao ||
            ""
          )}</textarea>

        </div>

    `;

  }


  html += `

      </div>

      <div class="actions">

        <button
          type="submit"
          class="btn btn-primary"
        >
          Salvar alterações
        </button>

        <button
          type="button"
          class="btn btn-secondary"
          onclick="fecharModal()"
        >
          Cancelar
        </button>

      </div>

    </form>

  `;


  const modalContent =
    document.getElementById(
      "modalContent"
    );

  const modal =
    document.getElementById(
      "modalEditar"
    );


  if (
    !modalContent ||
    !modal
  ) {

    alert(
      "Modal de edição não encontrado no HTML."
    );

    return;

  }


  modalContent.innerHTML =
    html;

  modal.classList.add(
    "show"
  );


  const formulario =
    document.getElementById(
      "form-edicao"
    );


  if (!formulario) {
    return;
  }


  formulario.addEventListener(
    "submit",
    async function (event) {

      event.preventDefault();


      const novoCodigo =
        document.getElementById(
          "edit-codigo"
        ).value.trim();


      const novoNome =
        document.getElementById(
          "edit-nome"
        ).value.trim();


      const novoStatus =
        document.getElementById(
          "edit-status"
        ).value;


      const novaObservacao =
        document.getElementById(
          "edit-observacao"
        ).value.trim();


      let novaFuncao = "";


           if (
        tipo ===
        "notebook"
      ) {

        const campoFuncao =
          document.getElementById(
            "edit-funcao"
          );

        if (campoFuncao) {

          novaFuncao =
            campoFuncao.value.trim();

        }

      }


      if (
        !novoCodigo ||
        !novoNome
      ) {

        alert(
          "Preencha o código e o nome."
        );

        return;

      }


      /* =====================================================
         VERIFICAR SE O NOVO CÓDIGO JÁ EXISTE
         ===================================================== */

      if (
        novoCodigo !==
        item.codigo
      ) {

        try {

          const {
            data: duplicado,
            error: erroDuplicado
          } =
            await supabaseClient
              .from("equipamentos")
              .select("id")
              .eq(
                "codigo",
                novoCodigo
              )
              .neq(
                "id",
                item.id
              )
              .maybeSingle();


          if (erroDuplicado) {
            throw erroDuplicado;
          }


          if (duplicado) {

            alert(
              "Outro equipamento já possui este código."
            );

            return;

          }

        } catch (error) {

          console.error(
            "Erro ao verificar código:",
            error
          );

          alert(
            "Não foi possível verificar o código do equipamento."
          );

          return;

        }

      }


      /* =====================================================
         DADOS DA QUEBRA
         ===================================================== */

      let quebradoData =
        item.quebradoEm?.data ||
        null;


      let quebradoHora =
        item.quebradoEm?.hora ||
        null;


      let quebradoObservacao =
        item.quebradoEm?.observacao ||
        null;


      /* =====================================================
         EQUIPAMENTO MUDOU DE FUNCIONANDO PARA QUEBRADO
         ===================================================== */

      if (
        item.status !== "Quebrado" &&
        novoStatus === "Quebrado"
      ) {

        const agora =
          dataHoraAtual();


        quebradoData =
          agora.data;


        quebradoHora =
          agora.hora;


        quebradoObservacao =
          novaObservacao ||
          null;

      }


      /* =====================================================
         EQUIPAMENTO CONTINUA QUEBRADO
         ===================================================== */

      else if (
        item.status === "Quebrado" &&
        novoStatus === "Quebrado"
      ) {

        if (editarQuebra) {

          const campoData =
            document.getElementById(
              "edit-quebrado-data"
            );


          const campoHora =
            document.getElementById(
              "edit-quebrado-hora"
            );


          const campoObservacao =
            document.getElementById(
              "edit-quebrado-observacao"
            );


          if (
            campoData &&
            campoData.value
          ) {

            quebradoData =
              campoData.value;

          }


          if (
            campoHora &&
            campoHora.value
          ) {

            quebradoHora =
              campoHora.value.length === 5
                ? campoHora.value + ":00"
                : campoHora.value;

          }


          if (campoObservacao) {

            quebradoObservacao =
              campoObservacao.value.trim() ||
              null;

          }

        }

        else {

          quebradoObservacao =
            novaObservacao ||
            null;

        }

      }


      /* =====================================================
         EQUIPAMENTO VOLTOU A FUNCIONAR
         ===================================================== */

      if (
        novoStatus === "Funcionando"
      ) {

        quebradoData =
          null;

        quebradoHora =
          null;

        quebradoObservacao =
          null;

      }


      /* =====================================================
         VALIDAR DATA E HORA DA QUEBRA
         ===================================================== */

      if (
        novoStatus === "Quebrado" &&
        (
          !quebradoData ||
          !quebradoHora
        )
      ) {

        alert(
          "Informe a data e a hora da quebra."
        );

        return;

      }


      /* =====================================================
         MONTAR DADOS ATUALIZADOS
         ===================================================== */

      const dadosAtualizados = {

        codigo:
          novoCodigo,

        nome:
          novoNome,

        funcao:
          tipo === "notebook"
            ? novaFuncao || null
            : null,

        status:
          novoStatus,

        observacao:
          novaObservacao || null,

        quebrado_data:
          quebradoData,

        quebrado_hora:
          quebradoHora,

        quebrado_observacao:
          quebradoObservacao

      };


      /* =====================================================
         SALVAR NO SUPABASE
         ===================================================== */

      try {

        const {
          error
        } =
          await supabaseClient
            .from("equipamentos")
            .update(
              dadosAtualizados
            )
            .eq(
              "id",
              item.id
            );


        if (error) {
          throw error;
        }


        /* ===================================================
           FECHAR MODAL
           =================================================== */

        fecharModal();


        /* ===================================================
           RECARREGAR DADOS DO BANCO
           =================================================== */

        await carregarDados();


        /* ===================================================
           GARANTIR PAGINAÇÃO CORRETA
           =================================================== */

        paginas[tipo] =
          Math.max(
            1,
            paginas[tipo] || 1
          );


        renderPage(
          tipo
        );


        /* ===================================================
           ATUALIZAR ABA DE QUEBRADOS
           =================================================== */

        preencherAnos();

        renderBroken();


        /* ===================================================
           ATUALIZAR DASHBOARD
           =================================================== */

        atualizarDashboard();


        alert(
          "Alterações salvas com sucesso!"
        );


      } catch (error) {

        console.error(
          "Erro ao editar equipamento:",
          error
        );


        alert(
          "Não foi possível salvar as alterações.\n\n" +
          (
            error.message ||
            "Verifique sua conexão com o banco de dados."
          )
        );

      }

    }
  );

}


/* =========================================================
   FECHAR MODAL
   ========================================================= */

function fecharModal() {

  const modal =
    document.getElementById(
      "modalEditar"
    );


  if (modal) {

    modal.classList.remove(
      "show"
    );

  }

}


/* =========================================================
   CLICAR FORA DO MODAL
   ========================================================= */

window.addEventListener(
  "click",
  function (event) {

    const modal =
      document.getElementById(
        "modalEditar"
      );


    if (
      modal &&
      event.target === modal
    ) {

      fecharModal();

    }

  }
);


/* =========================================================
   EXCLUIR EQUIPAMENTO
   ========================================================= */

async function excluirEquipamento(
  tipo,
  id,
  excluirQuebrado = false
) {

  const item =
    dados[tipo]?.find(
      function (equipamento) {

        return (
          String(
            equipamento.id
          ) ===
          String(id)
        );

      }
    );


  if (!item) {

    alert(
      "Equipamento não encontrado."
    );

    return;

  }


  const mensagem =
    excluirQuebrado
      ? `Deseja realmente excluir o equipamento quebrado "${item.nome}" (${item.codigo})?`
      : `Deseja realmente excluir o equipamento "${item.nome}" (${item.codigo})?`;


  const confirmou =
    confirm(mensagem);


  if (!confirmou) {
    return;
  }


  try {

    const {
      error
    } =
      await supabaseClient
        .from("equipamentos")
        .delete()
        .eq(
          "id",
          item.id
        );


    if (error) {
      throw error;
    }


    /* =====================================================
       RECARREGAR TODOS OS DADOS
       ===================================================== */

    await carregarDados();


    /* =====================================================
       CORRIGIR PAGINAÇÃO
       ===================================================== */

    paginas[tipo] =
      Math.max(
        1,
        paginas[tipo] || 1
      );


    renderPage(
      tipo
    );


    /* =====================================================
       ATUALIZAR ABA DE QUEBRADOS
       ===================================================== */

    preencherAnos();

    renderBroken();


    /* =====================================================
       ATUALIZAR DASHBOARD
       ===================================================== */

    atualizarDashboard();


    alert(
      excluirQuebrado
        ? "Equipamento quebrado excluído com sucesso!"
        : "Equipamento excluído com sucesso!"
    );


  } catch (error) {

    console.error(
      "Erro ao excluir equipamento:",
      error
    );


    alert(
      "Não foi possível excluir o equipamento.\n\n" +
      (
        error.message ||
        "Verifique sua conexão com o banco de dados."
      )
    );

  }

}


/* =========================================================
   FILTROS DOS EQUIPAMENTOS
   ========================================================= */

function registrarEventosBusca() {

  tipos.forEach(
    function (tipo) {

      const input =
        document.getElementById(
          "busca-" + tipo
        );


      if (!input) {
        return;
      }


      input.addEventListener(
        "input",
        function () {

          paginas[tipo] =
            1;

          renderPage(
            tipo
          );

        }
      );

    }
  );

}


/* =========================================================
   FILTROS DE QUEBRADOS
   ========================================================= */

function registrarEventosFiltrosQuebrados() {

  const busca =
    document.getElementById(
      "busca-quebrados"
    );


  const data =
    document.getElementById(
      "filtro-data"
    );


  const mes =
    document.getElementById(
      "filtro-mes"
    );


  const ano =
    document.getElementById(
      "filtro-ano"
    );


  if (busca) {

    busca.addEventListener(
      "input",
      function () {

        paginas.quebrados =
          1;

        renderBroken();

      }
    );

  }


  if (data) {

    data.addEventListener(
      "change",
      function () {

        paginas.quebrados =
          1;

        renderBroken();

      }
    );

  }


  if (mes) {

    mes.addEventListener(
      "change",
      function () {

        paginas.quebrados =
          1;

        renderBroken();

      }
    );

  }


  if (ano) {

    ano.addEventListener(
      "change",
      function () {

        paginas.quebrados =
          1;

        renderBroken();

      }
    );

  }

}


/* =========================================================
   LIMPAR FILTROS DE QUEBRADOS
   ========================================================= */

function limparFiltrosQuebrados() {

  const busca =
    document.getElementById(
      "busca-quebrados"
    );


  const data =
    document.getElementById(
      "filtro-data"
    );


  const mes =
    document.getElementById(
      "filtro-mes"
    );


  const ano =
    document.getElementById(
      "filtro-ano"
    );


  if (busca) {
    busca.value = "";
  }


  if (data) {
    data.value = "";
  }


  if (mes) {
    mes.value = "";
  }


  if (ano) {
    ano.value = "";
  }


  paginas.quebrados =
    1;


  renderBroken();

}


/* =========================================================
   FUNÇÕES DA ABA QUEBRADOS
   ========================================================= */

function preencherAnos() {

  const selectAno =
    document.getElementById(
      "filtro-ano"
    );


  if (!selectAno) {
    return;
  }


  const anos =
    new Set();


  /* =====================================================
     EQUIPAMENTOS MARCADOS COMO QUEBRADOS
     ===================================================== */

  tipos.forEach(
    function (tipo) {

      const lista =
        dados[tipo] || [];


      lista.forEach(
        function (item) {

          if (
            item.status === "Quebrado" &&
            item.quebradoEm?.data
          ) {

            const ano =
              String(
                item.quebradoEm.data
              ).substring(
                0,
                4
              );


            if (ano) {
              anos.add(ano);
            }

          }

        }
      );

    }
  );


  /* =====================================================
     REGISTROS MANUAIS
     ===================================================== */

  (
    dados.quebrados || []
  ).forEach(
    function (item) {

      if (
        item.criadoEm?.data
      ) {

        const ano =
          String(
            item.criadoEm.data
          ).substring(
            0,
            4
          );


        if (ano) {
          anos.add(ano);
        }

      }

    }
  );


  const anoAtual =
    new Date().getFullYear();


  anos.add(
    String(anoAtual)
  );


  const valorAtual =
    selectAno.value;


  selectAno.innerHTML =
    '<option value="">Todos os anos</option>';


  Array.from(anos)
    .sort(
      function (a, b) {

        return (
          Number(b) -
          Number(a)
        );

      }
    )
    .forEach(
      function (ano) {

        const option =
          document.createElement(
            "option"
          );


        option.value =
          ano;


        option.textContent =
          ano;


        selectAno.appendChild(
          option
        );

      }
    );


  if (
    Array.from(anos).includes(
      valorAtual
    )
  ) {

    selectAno.value =
      valorAtual;

  }

}


/* =========================================================
   FILTRAR QUEBRADOS
   ========================================================= */

function filtrarQuebrados() {

  let lista = [];


  /* =====================================================
     EQUIPAMENTOS CADASTRADOS NORMALMENTE
     ===================================================== */

  tipos.forEach(
    function (tipo) {

      const equipamentos =
        dados[tipo] || [];


      equipamentos.forEach(
        function (item) {

          if (
            item.status ===
            "Quebrado"
          ) {

            lista.push({

              ...item,

              origem:
                "equipamento",

              dataQuebra:
                item.quebradoEm?.data ||
                "",

              horaQuebra:
                item.quebradoEm?.hora ||
                "",

              observacaoQuebra:
                item.quebradoEm?.observacao ||
                item.observacao ||
                ""

            });

          }

        }
      );

    }
  );


  /* =====================================================
     REGISTROS MANUAIS
     ===================================================== */

  (
    dados.quebrados || []
  ).forEach(
    function (item) {

      lista.push({

        ...item,

        origem:
          "manual",

        dataQuebra:
          item.criadoEm?.data ||
          "",

        horaQuebra:
          item.criadoEm?.hora ||
          "",

        observacaoQuebra:
          item.observacao ||
          ""

      });

    }
  );


  /* =====================================================
     VALORES DOS FILTROS
     ===================================================== */

  const busca =
    document.getElementById(
      "busca-quebrados"
    )?.value
      ?.trim()
      .toLowerCase() ||
    "";


  const filtroData =
    document.getElementById(
      "filtro-data"
    )?.value ||
    "";


  const filtroMes =
    document.getElementById(
      "filtro-mes"
    )?.value ||
    "";


  const filtroAno =
    document.getElementById(
      "filtro-ano"
    )?.value ||
    "";


  /* =====================================================
     APLICAR FILTROS
     ===================================================== */

  lista =
    lista.filter(
      function (item) {

        const texto =
          (
            String(
              item.nome ||
              ""
            ) +
            " " +
            String(
              item.codigo ||
              ""
            ) +
            " " +
            String(
              item.observacaoQuebra ||
              ""
            )
          )
            .toLowerCase();


        if (
          busca &&
          !texto.includes(
            busca
          )
        ) {

          return false;

        }


        if (
          filtroData &&
          item.dataQuebra !==
            filtroData
        ) {

          return false;

        }


        if (filtroMes) {

          const mes =
            String(
              item.dataQuebra ||
              ""
            ).substring(
              5,
              7
            );


          if (
            mes !==
            filtroMes
          ) {

            return false;

          }

        }


        if (filtroAno) {

          const ano =
            String(
              item.dataQuebra ||
              ""
            ).substring(
              0,
              4
            );


          if (
            ano !==
            filtroAno
          ) {

            return false;

          }

        }


        return true;

      }
    );


  return lista;

}


/* =========================================================
   RENDERIZAR ABA DE QUEBRADOS
   ========================================================= */

function renderBroken() {

  const container =
    document.getElementById(
      "tabela-quebrados"
    );


  if (!container) {
    return;
  }


  const lista =
    filtrarQuebrados();


  const totalPaginas =
    Math.max(
      1,
      Math.ceil(
        lista.length /
        POR_PAGINA
      )
    );


  if (
    paginas.quebrados >
    totalPaginas
  ) {

    paginas.quebrados =
      totalPaginas;

  }


  if (
    paginas.quebrados <
    1
  ) {

    paginas.quebrados =
      1;

  }


  const inicio =
    (
      paginas.quebrados -
      1
    ) *
    POR_PAGINA;


  const pagina =
    lista.slice(
      inicio,
      inicio +
      POR_PAGINA
    );


  if (
    pagina.length ===
    0
  ) {

    container.innerHTML = `

      <div class="empty">

        Nenhum equipamento quebrado encontrado.

      </div>

    `;

    return;

  }


  let html = `

    <div class="table-container">

      <table>

        <thead>

          <tr>

            <th>
              Código
            </th>

            <th>
              Nome
            </th>

            <th>
              Quantidade
            </th>

            <th>
              Data
            </th>

            <th>
              Hora
            </th>

            <th>
              Observação
            </th>

            <th>
              Origem
            </th>

            <th>
              Ações
            </th>

          </tr>

        </thead>

        <tbody>

  `;


  pagina.forEach(
    function (item) {

      const quantidade =
        Number(
          item.quantidade ||
          1
        );


      const origem =
        item.origem ===
        "manual"
          ? "Manual"
          : "Equipamento";


      html += `

        <tr>

          <td>

            <strong>

              ${escapeHTML(
                item.codigo ||
                "-"
              )}

            </strong>

          </td>


          <td>

            ${escapeHTML(
              item.nome ||
              "-"
            )}

          </td>


          <td>

            <strong>

              ${quantidade}

            </strong>

          </td>


          <td>

            ${escapeHTML(
              formatarData(
                item.dataQuebra
              )
            )}

          </td>


          <td>

            ${escapeHTML(
              item.horaQuebra ||
              "-"
            )}

          </td>


          <td>

            ${escapeHTML(
              item.observacaoQuebra ||
              "-"
            )}

          </td>


          <td>

            <span
              class="status ${
                item.origem ===
                "manual"
                  ? "status-broken"
                  : "status-ok"
              }"
            >

              ${origem}

            </span>

          </td>


          <td>

            <div class="table-actions">

              ${
                item.origem ===
                "equipamento"

                  ? `

                    <button
                      type="button"
                      class="edit-btn"
                      onclick="editarEquipamento(
                        '${escapeJS(item.tipo)}',
                        '${escapeJS(item.id)}',
                        true
                      )"
                    >
                      ✏️ Editar
                    </button>

                    <button
                      type="button"
                      class="delete-btn"
                      onclick="excluirEquipamento(
                        '${escapeJS(item.tipo)}',
                        '${escapeJS(item.id)}',
                        true
                      )"
                    >
                      🗑️ Excluir
                    </button>

                  `

                  : `

                    <button
                      type="button"
                      class="edit-btn"
                      onclick="editarRegistroQuebrado(
                        '${escapeJS(item.id)}',
                        '${escapeJS(item.origem)}'
                      )"
                    >
                      ✏️ Editar
                    </button>

                    <button
                      type="button"
                      class="delete-btn"
                      onclick="excluirRegistroQuebrado(
                        '${escapeJS(item.id)}',
                        '${escapeJS(item.origem)}'
                      )"
                    >
                      🗑️ Excluir
                    </button>

                  `
              }

            </div>

          </td>

        </tr>

      `;

    }
  );


  html += `

        </tbody>

      </table>

    </div>

  `;


  html += criarPaginacao(

    "quebrados",

    totalPaginas,

    paginas.quebrados,

    "broken"

  );


  container.innerHTML =
    html;

}


/* =========================================================
   INICIALIZAÇÃO
   ========================================================= */

document.addEventListener(
  "DOMContentLoaded",
  async function () {

    console.log(
      "Sistema de Controle de Equipamentos iniciado."
    );


    registrarEventosFormularios();


    registrarEventosBusca();


    registrarEventosFiltrosQuebrados();


    await carregarDados();


    preencherAnos();


    atualizarDashboard();

  }
);


/* =========================================================
   EXPOSIÇÃO DAS FUNÇÕES NO WINDOW
   ========================================================= */

window.showPage =
  showPage;


window.toggleMenu =
  toggleMenu;


window.adicionarEquipamento =
  adicionarEquipamento;


window.editarEquipamento =
  editarEquipamento;


window.excluirEquipamento =
  excluirEquipamento;


window.adicionarQuebrado =
  adicionarQuebrado;


window.fecharModal =
  fecharModal;


window.mudarPagina =
  mudarPagina;


window.limparFiltrosQuebrados =
  limparFiltrosQuebrados;


/* =========================================================
   FIM DO SCRIPT
   ========================================================= */
