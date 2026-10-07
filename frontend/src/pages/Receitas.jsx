import { useState, useEffect } from "react";
import { FileText, Trash, List, ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function Receitas() {
  const navigate = useNavigate();

  const [descricao, setDescricao] = useState("");
  const [valor, setValor] = useState("");
  const [data, setData] = useState("");
  const [formaPagamento, setFormaPagamento] = useState("");
  const [categoria, setCategoria] = useState("");
  const [dataRecebimento, setDataRecebimento] = useState("");
  const [cliente, setCliente] = useState("");

  const [listaCategorias, setListaCategorias] = useState([]);
  const [listarFormaPagamento, setListarFormaPagamento] = useState([]);

  const [desconto, setDesconto] = useState("");
  const [status, setStatus] = useState("");
  const [editandoId, setEditandoId] = useState(null);

  const formaSelecionada = listarFormaPagamento.find(
    (forma) => String(forma.id) === String(formaPagamento),
  );

  const mostrarInput =
    formaSelecionada?.nome === "Cartão de crédito" ||
    formaSelecionada?.nome === "Cartão de débito" ||
    formaSelecionada?.nome === "Boleto";

  const tipoInput = () => {
    if (formaSelecionada?.nome === "Cartão de débito") {
      return "debito";
    }

    if (formaSelecionada?.nome === "Cartão de crédito") {
      return "credito";
    }

    if (formaSelecionada?.nome === "Boleto") {
      return "boleto";
    }

    return null;
  };

  async function carregarFormasPagamento() {
    try {
      const token = localStorage.getItem("access_token");

      const resposta = await fetch("http://127.0.0.1:5000/forma-pagamento/", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!resposta.ok) {
        throw new Error("Erro ao carregar formas de pagamento");
      }

      const dados = await resposta.json();

      setListarFormaPagamento(Array.isArray(dados) ? dados : []);
    } catch (erro) {
      console.error("Erro ao carregar formas de pagamento:", erro);

      setListarFormaPagamento([]);
    }
  }

  async function carregarCategorias() {
    try {
      const token = localStorage.getItem("access_token");

      const resposta = await fetch("http://localhost:5000/categoria/", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!resposta.ok) {
        throw new Error(`Erro HTTP: ${resposta.status}`);
      }

      const dados = await resposta.json();

      setListaCategorias(Array.isArray(dados) ? dados : []);
    } catch (erro) {
      console.error("Erro ao carregar categorias:", erro);

      setListaCategorias([]);
    }
  }

  useEffect(() => {
    carregarCategorias();
    carregarFormasPagamento();
  }, []);

  async function salvarReceita(e) {
    e.preventDefault();

    if (!descricao || !valor || !data || !categoria || !formaPagamento) {
      alert("Preencha todos os campos obrigatórios.");
      return;
    }

    const formaPagamentoSelecionada = listarFormaPagamento.find(
      (forma) => String(forma.id) === String(formaPagamento),
    );

    const payload = {
      descricao: descricao,

      valor: parseFloat(String(valor).replace(",", ".")) || 0,

      data: data,

      forma_pagamento: formaPagamentoSelecionada?.nome || "",

      categoria_id: categoria || null,

      data_recebimento:
        formaPagamentoSelecionada?.nome === "Boleto"
          ? dataRecebimento || data
          : data,

      cliente_nome: cliente || null,

      desconto: parseFloat(desconto) || 0,

      status:
        formaPagamentoSelecionada?.nome === "Boleto"
          ? String(status || "")
              .trim()
              .toLowerCase() === "pago"
            ? "Pago"
            : "A receber"
          : status || "Pago",
    };

    const url = editandoId
      ? `http://localhost:5000/receitas/${editandoId}`
      : "http://localhost:5000/receitas";

    const method = editandoId ? "PUT" : "POST";

    try {
      const token = localStorage.getItem("access_token");

      const res = await fetch(url, {
        method,

        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },

        body: JSON.stringify(payload),
      });

      const result = await res.json();

      if (!res.ok) {
        alert(result.erro || "Erro ao salvar receita.");

        return;
      }

      alert(result.mensagem || "Receita salva com sucesso.");

      limparFormulario();
    } catch (erro) {
      console.error("Erro ao salvar receita:", erro);

      alert("Não foi possível conectar ao servidor.");
    }
  }

  function limparFormulario() {
    setDescricao("");
    setValor("");
    setData("");
    setFormaPagamento("");
    setCategoria("");
    setDataRecebimento("");
    setCliente("");
    setDesconto("");
    setStatus("");
    setEditandoId(null);
  }

  return (
    <div className="md:ml-40 mt-5 pb-20 px-2 md:p-3 min-h-screen bg-slate-50">
      <div className="max-w-3xl mx-auto">
        <div className="md:hidden flex items-center gap-2 mb-3">
          <button
            type="button"
            onClick={() => window.history.back()}
            className="text-slate-800"
          >
            <ArrowLeft size={22} />
          </button>

          <h1 className="text-xl font-bold text-slate-800">Nova Venda</h1>
        </div>

        <div className="hidden md:block mb-6">
          <h1 className="text-3xl font-bold text-slate-800">
            Registrar Nova Venda
          </h1>

          <p className="text-slate-500 mt-1">Cadastre uma nova venda</p>
        </div>

        {/* ===============================
          FORMULÁRIO
      =============================== */}

        <div className="bg-white rounded-xl md:rounded-2xl shadow-md p-3 md:p-8">
          {/* CABEÇALHO */}

          <div className="flex items-center gap-2 mb-4 md:mb-7">
            <div className="w-9 h-9 md:w-12 md:h-12 rounded-full bg-blue-50 flex items-center justify-center shrink-0">
              <FileText className="w-5 h-5 md:w-6 md:h-6 text-blue-700" />
            </div>

            <div>
              <h2 className="text-lg md:text-xl font-bold text-slate-800">
                Dados da Venda
              </h2>

              <p className="text-xs md:text-sm text-slate-500">
                Preencha os dados da venda
              </p>
            </div>
          </div>

          <form onSubmit={salvarReceita} className="space-y-3 md:space-y-5">
            {/* DESCRIÇÃO */}

            <div>
              <label className="text-xs md:text-sm font-semibold text-slate-700">
                Descrição
              </label>

              <input
                type="text"
                value={descricao}
                onChange={(e) => setDescricao(e.target.value)}
                placeholder="Digite a descrição da venda"
                className="w-full h-10 md:h-12 mt-1.5 md:mt-2 px-3 md:px-4 text-sm border border-slate-200 rounded-lg md:rounded-xl focus:ring-2 focus:ring-blue-400 focus:outline-none"
              />
            </div>

            {/* VALOR + CATEGORIA */}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
              <div>
                <label className="text-xs md:text-sm font-semibold text-slate-700">
                  Valor
                </label>

                <input
                  type="number"
                  step="0.01"
                  value={valor}
                  onChange={(e) => setValor(e.target.value)}
                  placeholder="0,00"
                  className="w-full h-10 md:h-12 mt-1.5 md:mt-2 px-3 md:px-4 text-sm border border-slate-200 rounded-lg md:rounded-xl focus:ring-2 focus:ring-blue-400 focus:outline-none"
                />
              </div>

              <div>
                <label className="text-xs md:text-sm font-semibold text-slate-700">
                  Categoria
                </label>

                <select
                  value={categoria}
                  onChange={(e) => setCategoria(e.target.value)}
                  className="w-full h-10 md:h-12 mt-1.5 md:mt-2 px-3 md:px-4 text-sm border border-slate-200 rounded-lg md:rounded-xl bg-white focus:ring-2 focus:ring-blue-400 focus:outline-none"
                >
                  <option value="">Selecione</option>

                  {listaCategorias.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.nome}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* CLIENTE */}

            <div>
              <label className="text-xs md:text-sm font-semibold text-slate-700">
                Cliente
              </label>

              <input
                type="text"
                value={cliente}
                onChange={(e) => setCliente(e.target.value)}
                placeholder="Nome do cliente"
                className="w-full h-10 md:h-12 mt-1.5 md:mt-2 px-3 md:px-4 text-sm border border-slate-200 rounded-lg md:rounded-xl focus:ring-2 focus:ring-blue-400 focus:outline-none"
              />
            </div>

            {/* DATA + PAGAMENTO */}

            <div className="grid grid-cols-2 gap-2 md:gap-3">
              <div>
                <label className="text-xs md:text-sm font-semibold text-slate-700">
                  Data
                </label>

                <input
                  type="date"
                  value={data}
                  onChange={(e) => setData(e.target.value)}
                  className="w-full h-10 md:h-12 mt-1.5 md:mt-2 px-2 md:px-3 text-xs md:text-sm border border-slate-200 rounded-lg md:rounded-xl focus:ring-2 focus:ring-blue-400 focus:outline-none"
                />
              </div>

              <div>
                <label className="text-xs md:text-sm font-semibold text-slate-700">
                  Forma de Pagamento
                </label>

                <select
                  value={formaPagamento}
                  onChange={(e) => setFormaPagamento(e.target.value)}
                  className="w-full h-10 md:h-12 mt-1.5 md:mt-2 px-2 md:px-3 text-xs md:text-sm border border-slate-200 rounded-lg md:rounded-xl bg-white focus:ring-2 focus:ring-blue-400 focus:outline-none"
                >
                  <option value="">Selecione</option>

                  {listarFormaPagamento.map((forma) => (
                    <option key={forma.id} value={forma.id}>
                      {forma.nome}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* BOLETO / DÉBITO */}

            {mostrarInput && (
              <div>
                {tipoInput() === "debito" && (
                  <input
                    type="text"
                    value="À vista"
                    disabled
                    className="w-full h-10 md:h-12 border border-slate-200 rounded-lg md:rounded-xl px-3 md:px-4 text-sm bg-gray-100 text-gray-700"
                  />
                )}

                {tipoInput() === "boleto" && (
                  <div>
                    <label className="text-xs md:text-sm font-semibold text-slate-700">
                      Data de Recebimento
                    </label>

                    <input
                      type="date"
                      value={dataRecebimento}
                      onChange={(e) => setDataRecebimento(e.target.value)}
                      className="w-full h-10 md:h-12 mt-1.5 md:mt-2 px-3 md:px-4 text-sm border border-slate-200 rounded-lg md:rounded-xl"
                    />
                  </div>
                )}
              </div>
            )}

            {/* BOTÃO SALVAR */}

            <button
              type="submit"
              className="w-full h-11 md:h-14 bg-gradient-to-r from-blue-700 to-blue-500 hover:opacity-90 text-white font-bold text-base md:text-lg rounded-lg md:rounded-xl transition flex items-center justify-center gap-2"
            >
              <FileText size={19} />

              {editandoId ? "Salvar Alterações" : "Salvar Venda"}
            </button>

            {/* BOTÃO LIMPAR */}

            <button
              type="button"
              onClick={limparFormulario}
              className="w-full h-11 md:h-14 bg-white border-2 border-blue-500 text-slate-800 font-semibold text-base md:text-lg rounded-lg md:rounded-xl hover:bg-blue-50 transition flex items-center justify-center gap-2"
            >
              <Trash size={19} />
              Limpar
            </button>
          </form>
        </div>

        {/* ===============================
          BOTÃO LISTA DE VENDAS
      =============================== */}

        <button
          type="button"
          onClick={() => navigate("/lista-vendas")}
          className="w-full mt-3 md:mt-5 h-11 md:h-14 bg-slate-800 hover:bg-slate-900 text-white rounded-lg md:rounded-xl font-semibold text-sm md:text-base flex items-center justify-center gap-2 md:gap-3 shadow-md transition"
        >
          <List size={20} />
          Lista de Vendas
        </button>
      </div>
    </div>
  );
}
