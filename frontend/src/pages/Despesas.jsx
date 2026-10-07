import { useEffect, useState, useMemo } from "react";

import {
  Pencil,
  Trash,
  Wallet,
  CalendarClock,
  CircleCheck,
  Search,
  CircleDollarSign,
  ArrowLeft,
} from "lucide-react";

import { useNavigate } from "react-router-dom";

const API_URL = "http://localhost:5000";

export default function Despesas() {
  const [descricao, setDescricao] = useState("");
  const [valor, setValor] = useState("");
  const [data, setData] = useState("");
  const [categoria, setCategoria] = useState("");
  const [cliente, setCliente] = useState("");
  const [listaDespesas, setListaDespesas] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [busca, setBusca] = useState("");
  const [openModal, setOpenModal] = useState(false);
  const [status, setStatus] = useState("");

  const navigate = useNavigate();

  const statusColors = {
    "A pagar": "text-yellow-600",
    "Vence hoje": "text-blue-600",
    Atrasado: "text-red-600",
    Pago: "text-green-600",
  };

  async function carregarDespesas() {
    setLoading(true);

    try {
      const token = localStorage.getItem("access_token");

      const res = await fetch(`${API_URL}/despesas`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.erro || `Erro HTTP: ${res.status}`);
      }

      setListaDespesas(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Erro ao carregar despesas:", err);
      alert("Erro ao carregar despesas: " + err.message);
      setListaDespesas([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    carregarDespesas();
  }, []);

  const formatBRL = (v) =>
    new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(Number(v || 0));

  const formatDateBR = (d) => {
    if (!d) return "-";

    return new Date(d + "T00:00:00").toLocaleDateString("pt-BR");
  };

  function limparFormulario() {
    setDescricao("");
    setValor("");
    setData("");
    setCliente("");
    setCategoria("");
    setEditingId(null);
    setStatus("");
  }

  function calcularStatus(dataVencimento) {
    if (!dataVencimento) return "Sem Data";

    const hoje = new Date();
    const vencimento = new Date(dataVencimento + "T00:00:00");

    hoje.setHours(0, 0, 0, 0);

    if (vencimento.getTime() === hoje.getTime()) {
      return "Vence hoje";
    }

    if (vencimento.getTime() > hoje.getTime()) {
      return "A pagar";
    }

    return "Atrasado";
  }

  async function salvarDespesa(e) {
    e.preventDefault();

    if (!descricao || !valor || !data || !categoria) {
      alert("Preencha todos os campos obrigatórios");
      return;
    }

    const payload = {
      valor: Number(valor),
      data_pagamento: null,
      data_vencimento: data,
      nome: cliente,
      descricao: descricao,
      status: calcularStatus(data),
      categoria_id: categoria || null,
    };

    try {
      const token = localStorage.getItem("access_token");

      const res = await fetch(
        editingId ? `${API_URL}/despesas/${editingId}` : `${API_URL}/despesas`,
        {
          method: editingId ? "PUT" : "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(payload),
        },
      );

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.erro || "Erro ao salvar despesa");
      }

      limparFormulario();
      await carregarDespesas();
      setOpenModal(false);
    } catch (err) {
      alert(err.message);
    }
  }

  function editarDespesa(d) {
    setDescricao(d.Descricao || "");
    setValor(d.Valor || "");
    setData(d.Data || "");
    setCliente(d.Nome || "");
    setCategoria(d.CategoriaID || "");
    setEditingId(d.ID);
    setOpenModal(true);
    setStatus(d.Status || "");
  }

  async function excluirDespesa(id) {
    if (!confirm("Deseja excluir esta despesa?")) return;

    try {
      await fetch(`${API_URL}/despesas/${id}`, {
        method: "DELETE",
      });

      carregarDespesas();
    } catch (err) {
      alert(err.message);
    }
  }

  async function marcarComoPago(despesa) {
    const hoje = new Date().toISOString().split("T")[0];

    try {
      const res = await fetch(`${API_URL}/despesas/${despesa.ID}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...despesa,
          DataPagamento: hoje,
          Status: "Pago",
        }),
      });

      if (!res.ok) {
        throw new Error("Erro ao marcar como pago");
      }

      carregarDespesas();
    } catch (err) {
      alert(err.message);
    }
  }

  // FILTRO DE BUSCA
  const despesasFiltradas = useMemo(() => {
    const termo = busca.toLowerCase();

    const filtradas = listaDespesas.filter(
      (d) =>
        d.Descricao?.toLowerCase().includes(termo) ||
        d.CategoriaID?.toLowerCase().includes(termo) ||
        d.Nome?.toLowerCase().includes(termo),
    );

    return filtradas.sort((a, b) => {
      const statusA = a.Status || calcularStatus(a.DataVencimento);
      const statusB = b.Status || calcularStatus(b.DataVencimento);

      if (statusA === "Pago" && statusB !== "Pago") return 1;
      if (statusA !== "Pago" && statusB === "Pago") return -1;

      return 0;
    });
  }, [listaDespesas, busca]);

  // CÁLCULOS DOS CARDS
  const totalDespesas = listaDespesas.reduce(
    (acc, d) => acc + Number(d.Valor || 0),
    0,
  );

  const totalAVencer = listaDespesas
    .filter((d) => (d.Status || calcularStatus(d.DataVencimento)) !== "Pago")
    .reduce((acc, d) => acc + Number(d.Valor || 0), 0);

  const totalPagas = listaDespesas
    .filter((d) => (d.Status || calcularStatus(d.DataVencimento)) === "Pago")
    .reduce((acc, d) => acc + Number(d.Valor || 0), 0);

  return (
    <div className="md:ml-40 pt-4 pb-20 px-2 md:p-3 min-h-screen bg-slate-50">
      {" "}
      <div className="max-w-3xl mx-auto">
        <div className="md:hidden flex items-center justify-between gap-2 mb-4">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => navigate("/dashboard")}
              className="text-slate-800"
            >
              <ArrowLeft size={22} />
            </button>

            <h1 className="text-xl font-bold text-slate-800">Nova Despesa</h1>
          </div>

          <button
            type="button"
            onClick={() => {
              limparFormulario();
              setOpenModal(true);
            }}
            className="
              h-10
              px-3
              rounded-xl
              bg-green-600
              hover:bg-green-700
              text-white
              text-xs
              font-semibold
              shadow-sm
              transition
            "
          >
            + Adicionar
          </button>
        </div>

        {/* =====================================================
            CABEÇALHO DESKTOP
        ====================================================== */}

        <div className="hidden md:flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-slate-800">
              Registrar Nova Despesa
            </h1>

            <p className="text-slate-500 mt-1">Cadastre uma nova despesa</p>
          </div>

          <button
            type="button"
            onClick={() => {
              limparFormulario();
              setOpenModal(true);
            }}
            className="
              h-11
              px-5
              rounded-xl
              bg-green-600
              hover:bg-green-700
              text-white
              text-sm
              font-semibold
              shadow-sm
              transition
            "
          >
            + Cadastrar nova despesa
          </button>
        </div>

        {/* =====================================================
            CARDS
        ====================================================== */}

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 md:gap-5 mb-6">
          {/* TOTAL */}
          <div className="relative overflow-hidden bg-white rounded-2xl border border-slate-100 shadow-sm p-4 md:p-5">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs md:text-sm font-medium text-slate-500">
                  Total de despesas
                </p>

                <p className="text-xl md:text-2xl font-bold text-slate-800 mt-2">
                  {formatBRL(totalDespesas)}
                </p>
              </div>

              <div className="w-10 h-10 rounded-xl bg-red-50 flex items-center justify-center">
                <Wallet className="w-5 h-5 text-red-500" />
              </div>
            </div>

            <div className="absolute -right-8 -bottom-8 w-24 h-24 rounded-full bg-red-50/50" />
          </div>

          {/* A VENCER */}
          <div className="relative overflow-hidden bg-white rounded-2xl border border-slate-100 shadow-sm p-4 md:p-5">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs md:text-sm font-medium text-slate-500">
                  Em aberto
                </p>

                <p className="text-xl md:text-2xl font-bold text-amber-600 mt-2">
                  {formatBRL(totalAVencer)}
                </p>
              </div>

              <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center">
                <CalendarClock className="w-5 h-5 text-amber-500" />
              </div>
            </div>

            <div className="absolute -right-8 -bottom-8 w-24 h-24 rounded-full bg-amber-50/50" />
          </div>

          {/* PAGAS */}
          <div className="relative overflow-hidden bg-white rounded-2xl border border-slate-100 shadow-sm p-4 md:p-5">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs md:text-sm font-medium text-slate-500">
                  Pagas
                </p>

                <p className="text-xl md:text-2xl font-bold text-emerald-600 mt-2">
                  {formatBRL(totalPagas)}
                </p>
              </div>

              <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center">
                <CircleDollarSign className="w-5 h-5 text-emerald-500" />
              </div>
            </div>

            <div className="absolute -right-8 -bottom-8 w-24 h-24 rounded-full bg-emerald-50/50" />
          </div>
        </div>

        {/* =====================================================
            MODAL — NOVA DESPESA
        ====================================================== */}

        {openModal && (
          <div className="fixed inset-0 bg-slate-950/50 backdrop-blur-sm flex items-center justify-center z-50 p-3 md:p-6">
            <form
              onSubmit={salvarDespesa}
              className="
                relative
                bg-white
                w-full
                max-w-2xl
                max-h-[90vh]
                overflow-y-auto
                rounded-2xl
                md:rounded-3xl
                shadow-2xl
                p-5
                md:p-7
              "
            >
              {/* FECHAR */}
              <button
                type="button"
                onClick={() => {
                  limparFormulario();
                  setOpenModal(false);
                }}
                className="
                  absolute
                  top-4
                  right-4
                  w-9
                  h-9
                  rounded-xl
                  bg-slate-100
                  text-slate-500
                  hover:bg-slate-200
                  transition
                  flex
                  items-center
                  justify-center
                "
              >
                ✕
              </button>

              {/* TÍTULO */}
              <div className="mb-6 pr-10">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-green-50 flex items-center justify-center">
                    <Wallet className="w-5 h-5 text-green-600" />
                  </div>

                  <div>
                    <h2 className="text-lg md:text-xl font-bold text-slate-800">
                      {editingId ? "Editar despesa" : "Registrar nova despesa"}
                    </h2>

                    <p className="text-xs text-slate-500 mt-0.5">
                      Preencha as informações abaixo
                    </p>
                  </div>
                </div>
              </div>

              {/* FORMULÁRIO */}
              <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
                {/* DESCRIÇÃO */}
                <div className="md:col-span-7">
                  <label className="block text-xs font-semibold text-slate-600 mb-1.5">
                    Descrição
                  </label>

                  <input
                    className="
                      w-full
                      h-11
                      px-3.5
                      rounded-xl
                      bg-slate-50
                      border
                      border-slate-200
                      text-sm
                      outline-none
                      transition
                      focus:bg-white
                      focus:border-green-400
                      focus:ring-4
                      focus:ring-green-50
                    "
                    value={descricao}
                    onChange={(e) => setDescricao(e.target.value)}
                    placeholder="Ex.: Compra de materiais"
                  />
                </div>

                {/* VALOR */}
                <div className="md:col-span-5">
                  <label className="block text-xs font-semibold text-slate-600 mb-1.5">
                    Valor
                  </label>

                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-semibold text-slate-400">
                      R$
                    </span>

                    <input
                      type="number"
                      step="0.01"
                      className="
                        w-full
                        h-11
                        pl-10
                        pr-3
                        rounded-xl
                        bg-slate-50
                        border
                        border-slate-200
                        text-sm
                        font-semibold
                        outline-none
                        transition
                        focus:bg-white
                        focus:border-green-400
                        focus:ring-4
                        focus:ring-green-50
                      "
                      value={valor}
                      onChange={(e) => setValor(e.target.value)}
                      placeholder="0,00"
                    />
                  </div>
                </div>

                {/* CATEGORIA */}
                <div className="md:col-span-6">
                  <label className="block text-xs font-semibold text-slate-600 mb-1.5">
                    Categoria
                  </label>

                  <select
                    className="
                      w-full
                      h-11
                      px-3
                      rounded-xl
                      bg-slate-50
                      border
                      border-slate-200
                      text-sm
                      text-slate-700
                      outline-none
                      focus:bg-white
                      focus:border-green-400
                      focus:ring-4
                      focus:ring-green-50
                    "
                    value={categoria}
                    onChange={(e) => setCategoria(e.target.value)}
                  >
                    <option value="">Selecione uma categoria</option>

                    <option value="Contabilidade">Contabilidade</option>

                    <option value="Matéria-Prima">Matéria-Prima</option>

                    <option value="Funcionário">Funcionário</option>

                    <option value="Imposto">Imposto</option>

                    <option value="Retirada de Sócio">Retirada de Sócio</option>

                    <option value="Gasolina">Gasolina</option>

                    <option value="Energia/Água/Aluguel">
                      Energia / Água / Aluguel
                    </option>

                    <option value="Frete">Frete</option>

                    <option value="Equipamento">Equipamento</option>

                    <option value="Outros">Outros</option>
                  </select>
                </div>

                {/* NOME / FORNECEDOR */}
                <div className="md:col-span-6">
                  <label className="block text-xs font-semibold text-slate-600 mb-1.5">
                    Nome / Fornecedor
                  </label>

                  <input
                    className="
                      w-full
                      h-11
                      px-3.5
                      rounded-xl
                      bg-slate-50
                      border
                      border-slate-200
                      text-sm
                      outline-none
                      focus:bg-white
                      focus:border-green-400
                      focus:ring-4
                      focus:ring-green-50
                    "
                    value={cliente}
                    onChange={(e) => setCliente(e.target.value)}
                    placeholder="Ex.: Fornecedor ou empresa"
                  />
                </div>

                {/* VENCIMENTO */}
                <div className="md:col-span-6">
                  <label className="block text-xs font-semibold text-slate-600 mb-1.5">
                    Data de vencimento
                  </label>

                  <div className="relative">
                    <CalendarClock
                      size={17}
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
                    />

                    <input
                      type="date"
                      className="
                        w-full
                        h-11
                        pl-10
                        pr-3
                        rounded-xl
                        bg-slate-50
                        border
                        border-slate-200
                        text-sm
                        outline-none
                        focus:bg-white
                        focus:border-green-400
                        focus:ring-4
                        focus:ring-green-50
                      "
                      value={data}
                      onChange={(e) => setData(e.target.value)}
                    />
                  </div>
                </div>
              </div>

              {/* AÇÕES */}
              <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-2 mt-7 pt-5 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => {
                    limparFormulario();
                    setOpenModal(false);
                  }}
                  className="
                    h-11
                    px-5
                    rounded-xl
                    bg-slate-100
                    hover:bg-slate-200
                    text-slate-600
                    text-sm
                    font-semibold
                    transition
                  "
                >
                  Cancelar
                </button>

                <button
                  type="submit"
                  className="
                    h-11
                    px-6
                    rounded-xl
                    bg-green-600
                    hover:bg-green-700
                    text-white
                    text-sm
                    font-semibold
                    shadow-sm
                    transition
                  "
                >
                  {editingId ? "Salvar alterações" : "Salvar despesa"}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* =====================================================
            LISTA DE PAGAMENTOS
        ====================================================== */}

        <div className="bg-white rounded-2xl md:rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
          {/* CABEÇALHO DA LISTA */}
          <div className="p-4 md:p-6 border-b border-slate-100">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <h2 className="text-base md:text-lg font-bold text-slate-800">
                  Lista de pagamentos
                </h2>

                <p className="text-xs md:text-sm text-slate-400 mt-1">
                  Acompanhe suas despesas e vencimentos
                </p>
              </div>

              {/* PESQUISA */}
              <div className="relative w-full md:w-80">
                <Search
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
                  size={18}
                />

                <input
                  type="text"
                  placeholder="Pesquisar despesa..."
                  value={busca}
                  onChange={(e) => setBusca(e.target.value)}
                  className="
                    w-full
                    h-11
                    pl-10
                    pr-4
                    rounded-xl
                    bg-slate-50
                    border
                    border-slate-200
                    text-sm
                    outline-none
                    transition
                    focus:bg-white
                    focus:border-green-400
                    focus:ring-4
                    focus:ring-green-50
                  "
                />
              </div>
            </div>
          </div>

          {/* TABELA */}
          <div className="overflow-x-auto">
            <table className="w-full min-w-[350px] text-sm">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100">
                  <th className="px-5 py-4 text-left text-[11px] uppercase tracking-wide font-semibold text-slate-400">
                    Pagamento
                  </th>

                  <th className="px-5 py-4 text-left text-[11px] uppercase tracking-wide font-semibold text-slate-400">
                    Vencimento
                  </th>

                  <th className="px-5 py-4 text-left text-[11px] uppercase tracking-wide font-semibold text-slate-400">
                    Nome
                  </th>

                  <th className="px-5 py-4 text-left text-[11px] uppercase tracking-wide font-semibold text-slate-400">
                    Descrição
                  </th>

                  <th className="px-5 py-4 text-left text-[11px] uppercase tracking-wide font-semibold text-slate-400">
                    Valor
                  </th>

                  <th className="px-5 py-4 text-left text-[11px] uppercase tracking-wide font-semibold text-slate-400">
                    Categoria
                  </th>

                  <th className="px-5 py-4 text-left text-[11px] uppercase tracking-wide font-semibold text-slate-400">
                    Status
                  </th>

                  <th className="px-5 py-4 text-center text-[11px] uppercase tracking-wide font-semibold text-slate-400">
                    Ação
                  </th>

                  <th className="px-5 py-4 text-center text-[11px] uppercase tracking-wide font-semibold text-slate-400">
                    Ações
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100">
                {despesasFiltradas.map((d) => {
                  const statusAtual =
                    d.Status || calcularStatus(d.DataVencimento);

                  return (
                    <tr
                      key={d.ID}
                      className="group hover:bg-slate-50/70 transition-colors"
                    >
                      {/* PAGAMENTO */}
                      <td className="px-5 py-4 whitespace-nowrap text-slate-500">
                        {formatDateBR(d.DataPagamento)}
                      </td>

                      {/* VENCIMENTO */}
                      <td className="px-5 py-4 whitespace-nowrap text-slate-600">
                        {formatDateBR(d.DataVencimento)}
                      </td>

                      {/* NOME */}
                      <td className="px-5 py-4">
                        <span className="font-semibold text-slate-700">
                          {d.Nome || "Não informado"}
                        </span>
                      </td>

                      {/* DESCRIÇÃO */}
                      <td className="px-5 py-4 text-slate-500 max-w-[220px] truncate">
                        {d.Descricao || "-"}
                      </td>

                      {/* VALOR */}
                      <td className="px-5 py-4 whitespace-nowrap">
                        <span className="font-bold text-slate-800">
                          {formatBRL(d.Valor)}
                        </span>
                      </td>

                      {/* CATEGORIA */}
                      <td className="px-5 py-4 whitespace-nowrap">
                        <span className="inline-flex px-2.5 py-1 rounded-lg bg-slate-100 text-slate-600 text-xs font-medium">
                          {d.CategoriaID || "Sem categoria"}
                        </span>
                      </td>

                      {/* STATUS */}
                      <td className="px-5 py-4 whitespace-nowrap">
                        <span
                          className={`
                            inline-flex
                            items-center
                            px-3
                            py-1.5
                            rounded-full
                            text-xs
                            font-semibold
                            ${
                              statusAtual === "Pago"
                                ? "bg-emerald-50 text-emerald-600"
                                : statusAtual === "Atrasado"
                                  ? "bg-red-50 text-red-600"
                                  : statusAtual === "Vence hoje"
                                    ? "bg-blue-50 text-blue-600"
                                    : "bg-amber-50 text-amber-600"
                            }
                          `}
                        >
                          <span className="w-1.5 h-1.5 rounded-full bg-current mr-2" />

                          {statusAtual}
                        </span>
                      </td>

                      {/* PAGAR */}
                      <td className="px-5 py-4 text-center">
                        {statusAtual !== "Pago" ? (
                          <button
                            type="button"
                            onClick={() => marcarComoPago(d)}
                            className="
                              px-3
                              py-1.5
                              rounded-lg
                              bg-emerald-50
                              text-emerald-600
                              hover:bg-emerald-600
                              hover:text-white
                              text-xs
                              font-semibold
                              transition
                            "
                          >
                            Pagar
                          </button>
                        ) : (
                          <div className="flex justify-center">
                            <div className="w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center">
                              <CircleCheck
                                className="text-emerald-500"
                                size={17}
                              />
                            </div>
                          </div>
                        )}
                      </td>

                      {/* EDITAR / EXCLUIR */}
                      <td className="px-5 py-4">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            type="button"
                            onClick={() => editarDespesa(d)}
                            className="
                              w-9
                              h-9
                              rounded-lg
                              bg-blue-50
                              text-blue-600
                              hover:bg-blue-600
                              hover:text-white
                              transition
                              flex
                              items-center
                              justify-center
                            "
                            title="Editar"
                          >
                            <Pencil size={16} />
                          </button>

                          <button
                            type="button"
                            onClick={() => excluirDespesa(d.ID)}
                            className="
                              w-9
                              h-9
                              rounded-lg
                              bg-red-50
                              text-red-500
                              hover:bg-red-500
                              hover:text-white
                              transition
                              flex
                              items-center
                              justify-center
                            "
                            title="Excluir"
                          >
                            <Trash size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}

                {/* SEM RESULTADOS */}
                {despesasFiltradas.length === 0 && (
                  <tr>
                    <td colSpan="9" className="py-16 text-center">
                      <div className="flex flex-col items-center">
                        <div className="w-14 h-14 rounded-2xl bg-slate-100 flex items-center justify-center mb-3">
                          <Search size={24} className="text-slate-400" />
                        </div>

                        <p className="font-semibold text-slate-600">
                          Nenhuma despesa encontrada
                        </p>

                        <p className="text-sm text-slate-400 mt-1">
                          Tente pesquisar por outro termo.
                        </p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
