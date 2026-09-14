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

let equipamentoQuebradoEmEdicao = null;


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


function formatarDataExibicao(data) {

  if (!data) {
    return "-";
  }

  const partes =
    String(data).split("-");

  if (partes.length !== 3) {
    return escapeHTML(data);
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
/* =========================================================
   CONVERSÃO DE REGISTRO DE QUEBRADO
   ========================================================= */

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
          ? String(row.criado_em).substring(0, 10)
          : "",

      hora:
        row.criado_em
          ? String(row.criado_em).substring(11, 19)
          : ""

    }

  };

}

/* =========================================================
   CARREGAR QUEBRADOS MANUAIS
   ========================================================= */

async function carregarQuebrados() {

  try {

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

          return converterQuebrado(row);

        }
      );

  } catch (error) {

    console.error(
      "Erro ao carregar registros de quebrados:",
      error
    );

    alert(
      "Não foi possível carregar os registros de quebrados."
    );

  }

}



/* =========================================================
   CARREGAR DADOS
   ========================================================= */

async function carregarDados() {

  try {

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

  dados = {

  hh: [],
  notebook: [],
  radio: [],
  carregador: [],
  doisD: [],
  impressora: [],
  quebrados: []

};


    (data || []).forEach(
      function (row) {

        const equipamento =
          converterRegistro(row);

        if (
          tipos.includes(
            row.tipo
          )
        ) {

          dados[row.tipo].push(
            equipamento
          );

        }

      }
    );
await carregarQuebrados();

    atualizarDashboard();

    tipos.forEach(
      function (tipo) {

        const pagina =
          document.getElementById(
            tipo
          );

        if (
          pagina &&
          pagina.classList.contains(
            "active"
          )
        ) {

          renderPage(tipo);

        }

      }
    );

    const paginaQuebrados =
      document.getElementById(
        "quebrados"
      );

    if (
      paginaQuebrados &&
      paginaQuebrados.classList.contains(
        "active"
      )
    ) {

      preencherAnos();

      renderBroken();

    }

  } catch (error) {

    console.error(
      "Erro ao carregar dados:",
      error
    );

    alert(
      "Não foi possível carregar os equipamentos do banco de dados."
    );

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


/*
 * Equipamentos cadastrados
 * que estão quebrados.
 */

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


/*
 * Registros manuais de quebrados.
 */

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
    pageId ===
    "dashboard"
  ) {

    atualizarDashboard();

  }


  if (
    tipos.includes(pageId)
  ) {

    paginas[pageId] = 1;

    renderPage(
      pageId
    );

  }


  if (
    pageId ===
    "quebrados"
  ) {

    paginas.quebrados = 1;

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
    tipo ===
    "notebook"
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

    /*
     * Verifica código duplicado.
     */

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


    /*
     * Se já entrar como quebrado,
     * registra data e hora.
     */

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
      data,
      error
    } =
      await supabaseClient
        .from("equipamentos")
        .insert([
          registro
        ])
        .select()
        .single();


    if (error) {
      throw error;
    }


    const novo =
      converterRegistro(
        data
      );


    dados[tipo].unshift(
      novo
    );


    atualizarDashboard();

    limparForm(tipo);

    paginas[tipo] = 1;

    renderPage(tipo);


    mostrarAlerta(
      tipo,
      "Equipamento cadastrado com sucesso!"
    );


    if (
      status ===
      "Quebrado"
    ) {

      alert(
        "Equipamento registrado como QUEBRADO.\n\n" +
        "A data e a hora da quebra foram registradas automaticamente."
      );

    }

  } catch (error) {

    console.error(
      "Erro ao cadastrar:",
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
   CADASTRAR REGISTRO DE QUEBRADO
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
    !quantidade ||
    quantidade < 1
  ) {

    alert(
      "Informe uma quantidade válida."
    );

    quantidadeInput.focus();

    return;

  }


  try {

    const registro = {

      nome:
        nome,

      quantidade:
        quantidade,

      observacao:
        observacao || null

    };


    const {
      data,
      error
    } =
      await supabaseClient
        .from("quebrados")
        .insert([
          registro
        ])
        .select()
        .single();


    if (error) {
      throw error;
    }


    const novo =
      converterQuebrado(
        data
      );


    dados.quebrados.unshift(
      novo
    );


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


    renderBroken();


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

}
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



/* =========================================================
   BUSCA
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

        codigo.includes(
          busca
        ) ||

        nome.includes(
          busca
        ) ||

        observacao.includes(
          busca
        )

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


  if (
    paginas[tipo] >
    totalPaginas
  ) {

    paginas[tipo] =
      totalPaginas;

  }


  if (
    paginas[tipo] < 1
  ) {

    paginas[tipo] = 1;

  }


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

            <th>
              Código
            </th>

            <th>
              Nome
            </th>

            ${
              tipo === "notebook"
                ? `
                  <th>
                    Função
                  </th>
                `
                : ""
            }

            <th>
              Status
            </th>

            <th>
              Observação
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

      html += `

        <tr>

          <td>

            <strong>

              ${escapeHTML(
                item.codigo
              )}

            </strong>

          </td>


          <td>

            ${escapeHTML(
              item.nome
            )}

          </td>


          ${
            tipo === "notebook"
              ? `

                <td>

                  ${escapeHTML(
                    item.funcao ||
                    "-"
                  )}

                </td>

              `
              : ""
          }


          <td>

            <span
              class="status ${
                item.status ===
                "Quebrado"

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
              item.observacao ||
              "-"
            )}

          </td>


          <td>

            <div class="table-actions">

              <button

                type="button"

                class="edit-btn"

                onclick="editarEquipamento(
                  '${escapeHTML(tipo)}',
                  '${escapeHTML(item.id)}'
                )"

              >

                ✏️ Editar

              </button>


              <button

                type="button"

                class="delete-btn"

                onclick="excluirEquipamento(
                  '${escapeHTML(tipo)}',
                  '${escapeHTML(item.id)}'
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

  if (
    total <= 1
  ) {

    return "";

  }


  let html =
    `<div class="pagination">`;


  html += `

    <button

      type="button"

      onclick="
        mudarPagina(
          '${escapeHTML(tipo)}',
          ${atual - 1},
          '${escapeHTML(modo)}'
        )
      "

      ${atual === 1
        ? "disabled"
        : ""}

    >

      ← Anterior

    </button>

  `;


  for (
    let i = 1;
    i <= total;
    i++
  ) {

    html += `

      <button

        type="button"

        class="${
          i === atual
            ? "active"
            : ""
        }"

        onclick="
          mudarPagina(
            '${escapeHTML(tipo)}',
            ${i},
            '${escapeHTML(modo)}'
          )
        "

      >

        ${i}

      </button>

    `;

  }


  html += `

    <button

      type="button"

      onclick="
        mudarPagina(
          '${escapeHTML(tipo)}',
          ${atual + 1},
          '${escapeHTML(modo)}'
        )
      "

      ${atual === total
        ? "disabled"
        : ""}

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

  if (
    modo ===
    "broken"
  ) {

    paginas.quebrados =
      pagina;

    renderBroken();

    return;

  }


  paginas[tipo] =
    pagina;

  renderPage(
    tipo
  );

}


/* =========================================================
   EDITAR EQUIPAMENTO
   ========================================================= */

async function editarEquipamento(
  tipo,
  id
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


  let html = `

    <form id="form-edicao">

      <div class="form-grid">

        <div class="form-group">

          <label>
            Código
          </label>

          <input

            id="edit-codigo"

            value="${escapeHTML(
              item.codigo
            )}"

            required

          >

        </div>


        <div class="form-group">

          <label>
            Nome
          </label>

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
    tipo ===
    "notebook"
  ) {

    html += `

      <div class="form-group">

        <label>
          Função
        </label>

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

          <label>
            Status
          </label>

          <select
            id="edit-status">

            <option
              value="Funcionando"
              ${
                item.status ===
                "Funcionando"
                  ? "selected"
                  : ""
              }
            >

              Funcionando

            </option>


            <option
              value="Quebrado"
              ${
                item.status ===
                "Quebrado"
                  ? "selected"
                  : ""
              }
            >

              Quebrado

            </option>

          </select>

        </div>


        <div class="form-group full">

          <label>
            Observação
          </label>

          <textarea
            id="edit-observacao"
          >${escapeHTML(
            item.observacao || ""
          )}</textarea>

        </div>

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

        novaFuncao =
          document.getElementById(
            "edit-funcao"
          ).value.trim();

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


      /*
       * Verifica código duplicado
       * somente se o código mudou.
       */

      if (
        novoCodigo !==
        item.codigo
      ) {

        const {
          data: duplicado,
          error: erroDuplicado
        } =
          await supabaseClient

            .from(
              "equipamentos"
            )

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

          console.error(
            erroDuplicado
          );

          alert(
            "Não foi possível verificar o código."
          );

          return;

        }


        if (duplicado) {

          alert(
            "Outro equipamento já possui este código."
          );

          return;

        }

      }


      /*
       * Dados da quebra.
       */

      let quebradoData =
        item.quebradoEm?.data ||
        null;


      let quebradoHora =
        item.quebradoEm?.hora ||
        null;


      let quebradoObservacao =
        item.quebradoEm?.observacao ||
        null;


      /*
       * Funcionando → Quebrado.
       */

      if (
        item.status !==
          "Quebrado" &&
        novoStatus ===
          "Quebrado"
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


      /*
       * Se continua quebrado,
       * mantém a data original.
       */

      if (
        item.status ===
          "Quebrado" &&
        novoStatus ===
          "Quebrado"
      ) {

        quebradoObservacao =
          novaObservacao ||
          null;

      }


      /*
       * Quebrado → Funcionando.
       */

      if (
        novoStatus ===
        "Funcionando"
      ) {

        quebradoData =
          null;

        quebradoHora =
          null;

        quebradoObservacao =
          null;

      }


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


      try {

        const {
          data,
          error
        } =
          await supabaseClient

            .from(
              "equipamentos"
            )

            .update(
              dadosAtualizados
            )

            .eq(
              "id",
              item.id
            )

            .select()
            .single();


        if (error) {
          throw error;
        }


        const atualizado =
          converterRegistro(
            data
          );


        const indice =
          dados[tipo].findIndex(
            function (equipamento) {

              return (
                String(
                  equipamento.id
                ) ===
                String(item.id)
              );

            }
          );


        if (
          indice !== -1
        ) {

          dados[tipo][indice] =
            atualizado;

        }


        fecharModal();


        atualizarDashboard();

        renderPage(
          tipo
        );

        preencherAnos();

        renderBroken();


        alert(
          "Alterações salvas com sucesso!"
        );

      } catch (error) {

        console.error(
          "Erro ao editar:",
          error
        );

        alert(
          "Não foi possível salvar as alterações.\n\n" +
          (
            error.message ||
            ""
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
  id
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


  const confirmou =
    confirm(
      `Deseja realmente excluir o equipamento "${item.nome}" (${item.codigo})?`
    );


  if (!confirmou) {
    return;
  }


  try {

    const {
      error
    } =
      await supabaseClient

        .from(
          "equipamentos"
        )

        .delete()

        .eq(
          "id",
          item.id
        );


    if (error) {
      throw error;
    }


    dados[tipo] =
      dados[tipo].filter(
        function (equipamento) {

          return (
            String(
              equipamento.id
            ) !==
            String(item.id)
          );

        }
      );


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


    if (
      paginas[tipo] >
      totalPaginas
    ) {

      paginas[tipo] =
        totalPaginas;

    }


    atualizarDashboard();

    renderPage(tipo);

    preencherAnos();

    renderBroken();


    alert(
      "Equipamento excluído com sucesso!"
    );

  } catch (error) {

    console.error(
      "Erro ao excluir:",
      error
    );

    alert(
      "Não foi possível excluir o equipamento.\n\n" +
      (
        error.message ||
        ""
      )
    );

  }

}


/* =========================================================
   EQUIPAMENTOS QUEBRADOS
   ========================================================= */

function obterQuebrados() {

  const resultado = [];


  /* =====================================================
     EQUIPAMENTOS EXISTENTES COM STATUS QUEBRADO
     ===================================================== */

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

            resultado.push({

              ...item,

              tipo:
                tipo,

              origem:
                "equipamento",

              quantidade:
                1

            });

          }

        }
      );

    }
  );


  /* =====================================================
     REGISTROS MANUAIS
     ===================================================== */

  const manuais =
    Array.isArray(
      dados.quebrados
    )
      ? dados.quebrados
      : [];


  manuais.forEach(
    function (item) {

      resultado.push({

        ...item,

        tipo:
          "quebrado",

        origem:
          "manual",

        codigo:
          "",

        quebradoEm: {

          data:
            item.criadoEm?.data || "",

          hora:
            item.criadoEm?.hora || "",

          observacao:
            item.observacao || ""

        }

      });

    }
  );


  /* =====================================================
     ORDENAÇÃO
     ===================================================== */

  resultado.sort(
    function (a, b) {

      const dataA =
        a.quebradoEm

          ? `${a.quebradoEm.data} ${a.quebradoEm.hora}`

          : "";


      const dataB =
        b.quebradoEm

          ? `${b.quebradoEm.data} ${b.quebradoEm.hora}`

          : "";


      return dataB.localeCompare(
        dataA
      );

    }
  );


  return resultado;

}


/* =========================================================
   FILTRAR QUEBRADOS
   ========================================================= */

function filtrarQuebrados() {

  const buscaElemento =
    document.getElementById(
      "busca-quebrados"
    );


  const dataElemento =
    document.getElementById(
      "filtro-data"
    );


  const mesElemento =
    document.getElementById(
      "filtro-mes"
    );


  const anoElemento =
    document.getElementById(
      "filtro-ano"
    );


  const busca =
    buscaElemento
      ? buscaElemento.value
          .trim()
          .toLowerCase()
      : "";


  const data =
    dataElemento
      ? dataElemento.value
      : "";


  const mes =
    mesElemento
      ? mesElemento.value
      : "";


  const ano =
    anoElemento
      ? anoElemento.value
      : "";


  let lista =
    obterQuebrados();


  lista =
    lista.filter(
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
            item.observacao || ""
          ).toLowerCase();


        /*
         * Busca por código,
         * nome ou observação.
         */

        if (
          busca &&
          !codigo.includes(
            busca
          ) &&
          !nome.includes(
            busca
          ) &&
          !observacao.includes(
            busca
          )
        ) {

          return false;

        }


        /*
         * Data completa.
         */

        if (
          data &&
          (
            !item.quebradoEm ||
            item.quebradoEm.data !==
              data
          )
        ) {

          return false;

        }


        /*
         * Mês.
         */

        if (mes) {

          if (
            !item.quebradoEm ||
            !item.quebradoEm.data
          ) {

            return false;

          }


          const mesQuebra =
            item.quebradoEm.data
              .split("-")[1];


          if (
            mesQuebra !==
            String(mes).padStart(
              2,
              "0"
            )
          ) {

            return false;

          }

        }


        /*
         * Ano.
         */

        if (ano) {

          if (
            !item.quebradoEm ||
            !item.quebradoEm.data
          ) {

            return false;

          }


          const anoQuebra =
            item.quebradoEm.data
              .split("-")[0];


          if (
            anoQuebra !==
            String(ano)
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
   PREENCHER ANOS
   ========================================================= */

function preencherAnos() {

  const select =
    document.getElementById(
      "filtro-ano"
    );


  if (!select) {
    return;
  }


  const anoSelecionado =
    select.value;


  const anos =
    new Set();


  obterQuebrados().forEach(
    function (item) {

      if (
        item.quebradoEm &&
        item.quebradoEm.data
      ) {

        const ano =
          item.quebradoEm.data
            .split("-")[0];


        if (ano) {
          anos.add(ano);
        }

      }

    }
  );


  const listaAnos =
    Array.from(anos)
      .sort(
        function (a, b) {

          return (
            Number(b) -
            Number(a)
          );

        }
      );


  select.innerHTML = `

    <option value="">
      Todos os anos
    </option>

  `;


  listaAnos.forEach(
    function (ano) {

      const option =
        document.createElement(
          "option"
        );


      option.value =
        ano;


      option.textContent =
        ano;


      if (
        ano ===
        anoSelecionado
      ) {

        option.selected =
          true;

      }


      select.appendChild(
        option
      );

    }
  );

}


/* =========================================================
   RENDERIZAR QUEBRADOS
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
    paginas.quebrados < 1
  ) {

    paginas.quebrados =
      1;

  }


  const inicio =
    (
      paginas.quebrados - 1
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

        Nenhum equipamento quebrado
        encontrado com os filtros
        selecionados.

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
              Tipo
            </th>

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
              Ações
            </th>

          </tr>

        </thead>

        <tbody>

  `;


  pagina.forEach(
    function (item) {

      const tipo =
        item.tipo;


      const nomeTipo =
        item.origem === "manual"
          ? "Registro manual"
          : (
              nomesTipos[tipo] ||
              tipo
            );


      const quantidade =
        Number(
          item.quantidade || 1
        );


      const observacao =
        item.origem === "manual"
          ? (
              item.observacao ||
              "-"
            )
          : (
              item.observacao ||
              item.quebradoEm?.observacao ||
              "-"
            );


      const data =
        item.origem === "manual"
          ? item.quebradoEm?.data
          : item.quebradoEm?.data;


      const hora =
        item.origem === "manual"
          ? item.quebradoEm?.hora
          : item.quebradoEm?.hora;


      html += `

        <tr>

          <td>

            <strong>

              ${escapeHTML(
                nomeTipo
              )}

            </strong>

          </td>


          <td>

            ${
              item.codigo
                ? escapeHTML(
                    item.codigo
                  )
                : "-"
            }

          </td>


          <td>

            ${escapeHTML(
              item.nome
            )}

          </td>


          <td>

            <strong>

              ${quantidade}

            </strong>

          </td>


          <td>

            ${
              data
                ? formatarDataExibicao(
                    data
                  )
                : "-"
            }

          </td>


          <td>

            ${
              hora
                ? escapeHTML(
                    hora
                  )
                : "-"
            }

          </td>


          <td>

            ${escapeHTML(
              observacao
            )}

          </td>


          <td>

            <div class="table-actions">

              <button

                type="button"

                class="edit-btn"

                onclick="
                  editarRegistroQuebrado(
                    '${escapeHTML(
                      item.origem || "equipamento"
                    )}',
                    '${escapeHTML(
                      item.tipo || ""
                    )}',
                    '${escapeHTML(
                      item.id
                    )}'
                  )
                "

              >

                ✏️ Editar

              </button>


              <button

                type="button"

                class="delete-btn"

                onclick="
                  excluirRegistroQuebrado(
                    '${escapeHTML(
                      item.origem || "equipamento"
                    )}',
                    '${escapeHTML(
                      item.tipo || ""
                    )}',
                    '${escapeHTML(
                      item.id
                    )}'
                  )
                "

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

    "quebrados",

    totalPaginas,

    paginas.quebrados,

    "broken"

  );


  container.innerHTML =
    html;

}


/* =========================================================
   EDITAR EQUIPAMENTO QUEBRADO
   ========================================================= */
async function editarRegistroManual(
  id
) {

  const item =
    dados.quebrados?.find(
      function (registro) {

        return (
          String(
            registro.id
          ) ===
          String(id)
        );

      }
    );


  if (!item) {

    alert(
      "Registro de quebrado não encontrado."
    );

    return;

  }


  const html = `

    <form id="form-edicao-quebrado-manual">

      <div class="form-grid">

        <div class="form-group">

          <label for="edit-manual-nome">
            Nome *
          </label>

          <input

            id="edit-manual-nome"

            type="text"

            value="${escapeHTML(
              item.nome
            )}"

            required

          >

        </div>


        <div class="form-group">

          <label for="edit-manual-quantidade">
            Quantidade *
          </label>

          <input

            id="edit-manual-quantidade"

            type="number"

            min="1"

            value="${Number(
              item.quantidade || 1
            )}"

            required

          >

        </div>


        <div class="form-group full">

          <label for="edit-manual-observacao">
            Observações
          </label>

          <textarea

            id="edit-manual-observacao"

          >${escapeHTML(
            item.observacao || ""
          )}</textarea>

        </div>

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
      "Modal de edição não encontrado."
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
      "form-edicao-quebrado-manual"
    );


  formulario.addEventListener(
    "submit",
    async function (event) {

      event.preventDefault();


      const nome =
        document.getElementById(
          "edit-manual-nome"
        ).value.trim();


      const quantidade =
        Number(
          document.getElementById(
            "edit-manual-quantidade"
          ).value
        );


      const observacao =
        document.getElementById(
          "edit-manual-observacao"
        ).value.trim();


      if (!nome) {

        alert(
          "Informe o nome do equipamento."
        );

        return;

      }


      if (
        !quantidade ||
        quantidade < 1
      ) {

        alert(
          "Informe uma quantidade válida."
        );

        return;

      }


      try {

        const dadosAtualizados = {

          nome:
            nome,

          quantidade:
            quantidade,

          observacao:
            observacao || null

        };


        const {
          data,
          error
        } =
          await supabaseClient

            .from(
              "quebrados"
            )

            .update(
              dadosAtualizados
            )

            .eq(
              "id",
              item.id
            )

            .select()
            .single();


        if (error) {
          throw error;
        }


        const atualizado =
          converterQuebrado(
            data
          );


        const indice =
          dados.quebrados.findIndex(
            function (registro) {

              return (
                String(
                  registro.id
                ) ===
                String(item.id)
              );

            }
          );


        if (
          indice !== -1
        ) {

          dados.quebrados[indice] =
            atualizado;

        }


        fecharModal();

        renderBroken();


        alert(
          "Registro atualizado com sucesso!"
        );


      } catch (error) {

        console.error(
          "Erro ao editar registro manual:",
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

function editarRegistroQuebrado(
  origem,
  tipo,
  id
) {

  if (
    origem ===
    "manual"
  ) {

    editarRegistroManual(
      id
    );

    return;

  }


  editarQuebrado(
    tipo,
    id
  );

}


async function editarQuebrado(
  tipo,
  id
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


  let html = `

    <form id="form-edicao-quebrado">

      <div class="form-grid">

        <div class="form-group">

          <label>
            Código
          </label>

          <input

            id="edit-quebrado-codigo"

            value="${escapeHTML(
              item.codigo
            )}"

            required

          >

        </div>


        <div class="form-group">

          <label>
            Nome
          </label>

          <input

            id="edit-quebrado-nome"

            value="${escapeHTML(
              item.nome
            )}"

            required

          >

        </div>


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

            required

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
                ? item.quebradoEm.hora.substring(0, 5)
                : ""
            }"

            required

          >

        </div>


        ${
          tipo === "notebook"
            ? `

              <div class="form-group">

                <label>
                  Função
                </label>

                <input

                  id="edit-quebrado-funcao"

                  value="${escapeHTML(
                    item.funcao || ""
                  )}"

                >

              </div>

            `
            : ""
        }


        <div class="form-group full">

          <label>
            Observação da quebra
          </label>

          <textarea
            id="edit-quebrado-observacao"
            required
          >${escapeHTML(
            item.quebradoEm?.observacao ||
            item.observacao ||
            ""
          )}</textarea>

        </div>

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
      "form-edicao-quebrado"
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
          "edit-quebrado-codigo"
        ).value.trim();


      const novoNome =
        document.getElementById(
          "edit-quebrado-nome"
        ).value.trim();


      const novaData =
        document.getElementById(
          "edit-quebrado-data"
        ).value;


      const novaHora =
        document.getElementById(
          "edit-quebrado-hora"
        ).value;


      const novaObservacao =
        document.getElementById(
          "edit-quebrado-observacao"
        ).value.trim();


      let novaFuncao = "";


      if (
        tipo ===
        "notebook"
      ) {

        const campoFuncao =
          document.getElementById(
            "edit-quebrado-funcao"
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


      if (
        !novaData ||
        !novaHora
      ) {

        alert(
          "Informe a data e a hora da quebra."
        );

        return;

      }


      if (!novaObservacao) {

        alert(
          "Informe a observação da quebra."
        );

        return;

      }


      /*
       * Verifica código duplicado
       * somente se o código mudou.
       */

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

              .from(
                "equipamentos"
              )

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


      const dadosAtualizados = {

        codigo:
          novoCodigo,

        nome:
          novoNome,

        funcao:
          tipo === "notebook"
            ? novaFuncao || null
            : null,

        /*
         * Continua quebrado.
         */

        status:
          "Quebrado",

        observacao:
          novaObservacao || null,

        quebrado_data:
          novaData,

        quebrado_hora:
          novaHora,

        quebrado_observacao:
          novaObservacao || null

      };


      try {

        const {
          data,
          error
        } =
          await supabaseClient

            .from(
              "equipamentos"
            )

            .update(
              dadosAtualizados
            )

            .eq(
              "id",
              item.id
            )

            .select()
            .single();


        if (error) {
          throw error;
        }


        const atualizado =
          converterRegistro(
            data
          );


        const indice =
          dados[tipo].findIndex(
            function (equipamento) {

              return (
                String(
                  equipamento.id
                ) ===
                String(item.id)
              );

            }
          );


        if (
          indice !== -1
        ) {

          dados[tipo][indice] =
            atualizado;

        }


        fecharModal();


        atualizarDashboard();


        /*
         * Atualiza a página
         * do equipamento.
         */

        renderPage(
          tipo
        );


        /*
         * Atualiza a lista
         * de equipamentos quebrados.
         */

        preencherAnos();

        renderBroken();


        alert(
          "Equipamento quebrado atualizado com sucesso!"
        );

      } catch (error) {

        console.error(
          "Erro ao editar equipamento quebrado:",
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
   EXCLUIR REGISTRO MANUAL
   ========================================================= */

async function excluirRegistroManual(
  id
) {

  const item =
    dados.quebrados?.find(
      function (registro) {

        return (
          String(
            registro.id
          ) ===
          String(id)
        );

      }
    );


  if (!item) {

    alert(
      "Registro de quebrado não encontrado."
    );

    return;

  }


  const confirmou =
    confirm(
      `Deseja realmente excluir o registro "${item.nome}"?`
    );


  if (!confirmou) {
    return;
  }


  try {

    const {
      error
    } =
      await supabaseClient

        .from(
          "quebrados"
        )

        .delete()

        .eq(
          "id",
          item.id
        );


    if (error) {
      throw error;
    }


    dados.quebrados =
      dados.quebrados.filter(
        function (registro) {

          return (
            String(
              registro.id
            ) !==
            String(item.id)
          );

        }
      );


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


    renderBroken();


    alert(
      "Registro excluído com sucesso!"
    );


  } catch (error) {

    console.error(
      "Erro ao excluir registro manual:",
      error
    );

    alert(
      "Não foi possível excluir o registro.\n\n" +
      (
        error.message ||
        "Verifique sua conexão com o banco de dados."
      )
    );

  }

}

/* =========================================================
   EXCLUIR REGISTRO DE QUEBRADO
   ========================================================= */

function excluirRegistroQuebrado(
  origem,
  tipo,
  id
) {

  if (
    origem ===
    "manual"
  ) {

    excluirRegistroManual(
      id
    );

    return;

  }


  excluirQuebrado(
    tipo,
    id
  );

}


/* =========================================================
   EXCLUIR EQUIPAMENTO QUEBRADO
   ========================================================= */

async function excluirQuebrado(
  tipo,
  id
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


  const confirmou =
    confirm(
      `Deseja realmente excluir o equipamento quebrado "${item.nome}" (${item.codigo})?`
    );


  if (!confirmou) {
    return;
  }


  try {

    const {
      error
    } =
      await supabaseClient

        .from(
          "equipamentos"
        )

        .delete()

        .eq(
          "id",
          item.id
        );


    if (error) {
      throw error;
    }


    dados[tipo] =
      dados[tipo].filter(
        function (equipamento) {

          return (
            String(
              equipamento.id
            ) !==
            String(item.id)
          );

        }
      );


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


    atualizarDashboard();


    /*
     * Atualiza a página normal
     * do equipamento.
     */

    renderPage(
      tipo
    );


    /*
     * Atualiza os filtros de ano.
     */

    preencherAnos();


    /*
     * Atualiza a lista de quebrados.
     */

    renderBroken();


    alert(
      "Equipamento quebrado excluído com sucesso!"
    );

  } catch (error) {

    console.error(
      "Erro ao excluir equipamento quebrado:",
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
   INICIALIZAÇÃO
   ========================================================= */

document.addEventListener(
  "DOMContentLoaded",
  async function () {

    console.log(
      "Sistema de Controle de Equipamentos iniciado."
    );


    /*
     * Registra os eventos
     * dos formulários.
     */

    registrarEventosFormularios();


    /*
     * Registra as buscas
     * dos equipamentos.
     */

    registrarEventosBusca();


    /*
     * Registra os filtros
     * da página de quebrados.
     */

    registrarEventosFiltrosQuebrados();


    /*
     * Carrega os dados
     * do Supabase.
     */

    await carregarDados();


    /*
     * Garante que o dashboard
     * seja atualizado.
     */

     await carregarQuebrados();

    atualizarDashboard();


    /*
     * Preenche o filtro
     * de anos.
     */

    preencherAnos();

  }
);


/* =========================================================
   EXPOSIÇÃO DAS FUNÇÕES NO WINDOW
   =========================================================
   Necessário quando o HTML usa
   onclick="..."
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

window.editarRegistroQuebrado =
  editarRegistroQuebrado;

window.excluirRegistroQuebrado =
  excluirRegistroQuebrado;


window.editarQuebrado =
  editarQuebrado;

window.excluirQuebrado =
  excluirQuebrado;

window.fecharModal =
  fecharModal;

window.mudarPagina =
  mudarPagina;

window.limparFiltrosQuebrados =
  limparFiltrosQuebrados;

window.adicionarQuebrado =
  adicionarQuebrado;



/* =========================================================
   FIM DO SCRIPT
   ========================================================= */
