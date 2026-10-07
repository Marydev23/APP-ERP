import { useEffect, useState } from "react";
import { Pencil, Trash, Search, ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function ListaVendas() {
  const navigate = useNavigate();

  const [listaReceitas, setListaReceitas] = useState([]);
  const [listaCategorias, setListaCategorias] = useState([]);
  const [busca, setBusca] = useState("");

  async function carregarReceitas() {
    try {
      const token = localStorage.getItem("access_token");

      const resposta = await fetch("http://localhost:5000/receitas", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!resposta.ok) {
        throw new Error(`Erro HTTP: ${resposta.status}`);
      }

      const dados = await resposta.json();

      setListaReceitas(Array.isArray(dados) ? dados : []);
    } catch (erro) {
      console.error("Erro ao carregar receitas:", erro);
      setListaReceitas([]);
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
    carregarReceitas();
    carregarCategorias();
  }, []);

  const formatarData = (d) => {
    if (!d) return "-";

    return new Date(d + "T00:00:00").toLocaleDateString("pt-BR");
  };

  const formatarValor = (v) => {
    const valorSeguro = Number(v) || 0;

    return valorSeguro.toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL",
    });
  };

  function calcularStatus(r) {
    const statusAtual = String(r.status || "")
      .trim()
      .toLowerCase();

    if (statusAtual === "pago") {
      return "Pago";
    }

    const formaPagamento = String(r.forma_pagamento || "")
      .trim()
      .toLowerCase();

    if (formaPagamento === "boleto") {
      const dataVencimentoStr = r.data_recebimento || r.data;

      if (!dataVencimentoStr) {
        return "Sem data";
      }

      const dataVencimento = new Date(`${dataVencimentoStr}T00:00:00`);

      const hoje = new Date();
      hoje.setHours(0, 0, 0, 0);

      if (dataVencimento < hoje) {
        return "Atrasado";
      }

      return "A receber";
    }

    return "Recebido";
  }

  async function excluirReceita(id) {
    if (!confirm("Deseja realmente excluir esta venda?")) {
      return;
    }

    try {
      const token = localStorage.getItem("access_token");

      const res = await fetch(`http://localhost:5000/receitas/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) {
        throw new Error(`Erro HTTP: ${res.status}`);
      }

      carregarReceitas();
    } catch (erro) {
      console.error("Erro ao excluir:", erro);
      alert("Não foi possível excluir a venda.");
    }
  }

  async function marcarComoPaga(id) {
    if (!confirm("Deseja marcar esta receita como paga?")) {
      return;
    }

    try {
      const token = localStorage.getItem("access_token");

      const res = await fetch(`http://localhost:5000/receitas/${id}/pagar`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const result = await res.json();

      if (!res.ok) {
        alert(result.erro || "Não foi possível marcar como paga.");
        return;
      }

      carregarReceitas();
    } catch (erro) {
      console.error("Erro ao marcar como paga:", erro);
      alert("Não foi possível conectar ao servidor.");
    }
  }

  function editarReceita(id) {
    navigate(`/receitas?editar=${id}`);
  }

  const listaFiltrada = listaReceitas.filter((r) => {
    const termo = busca.toLowerCase();

    return (
      r.descricao?.toLowerCase().includes(termo) ||
      r.cliente_nome?.toLowerCase().includes(termo)
    );
  });

  return (
    <div className="md:ml-64 mt-5 px-3 md:p-6 h-[calc(100vh-20px)] overflow-hidden bg-[#f6f8fc]">
      <div className="max-w-7xl mx-auto h-full flex flex-col">
        {/* ================= CABEÇALHO ================= */}
        <div className="flex items-center justify-between mb-6 shrink-0">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => navigate("/receitas")}
              className="
                w-10
                h-10
                flex
                items-center
                justify-center
                rounded-xl
                bg-white
                border
                border-slate-200
                text-slate-600
                hover:bg-slate-50
                hover:text-blue-600
                transition
              "
            >
              <ArrowLeft size={20} />
            </button>

            <div>
              <h1 className="text-xl md:text-3xl font-bold text-slate-800">
                Lista de Vendas
              </h1>

              <p className="text-xs md:text-sm text-slate-500 mt-0.5">
                Acompanhe suas vendas e recebimentos
              </p>
            </div>
          </div>
        </div>

        {/* ================= RESUMO ================= */}
        <div className="grid grid-cols-3 gap-2 md:gap-4 mb-5 shrink-0">
          {/* TOTAL */}
          <div className="bg-white rounded-xl md:rounded-2xl border border-slate-100 shadow-sm p-3 md:p-5">
            <p className="text-[10px] md:text-xs text-slate-500 font-medium">
              Total de vendas
            </p>

            <p className="text-lg md:text-2xl font-bold text-slate-800 mt-1">
              {listaFiltrada.length}
            </p>
          </div>

          {/* RECEBIDAS */}
          <div className="bg-white rounded-xl md:rounded-2xl border border-slate-100 shadow-sm p-3 md:p-5">
            <p className="text-[10px] md:text-xs text-slate-500 font-medium">
              Recebidas
            </p>

            <p className="text-lg md:text-2xl font-bold text-emerald-600 mt-1">
              {listaFiltrada.filter((r) => calcularStatus(r) === "Pago").length}
            </p>
          </div>

          {/* A RECEBER */}
          <div className="bg-white rounded-xl md:rounded-2xl border border-slate-100 shadow-sm p-3 md:p-5">
            <p className="text-[10px] md:text-xs text-slate-500 font-medium">
              A receber
            </p>

            <p className="text-lg md:text-2xl font-bold text-blue-600 mt-1">
              {
                listaFiltrada.filter((r) => calcularStatus(r) === "A receber")
                  .length
              }
            </p>
          </div>
        </div>

        {/* ================= CARD PRINCIPAL ================= */}
        <div
          className="
            bg-white
            rounded-2xl
            md:rounded-3xl
            border
            border-slate-100
            shadow-sm
            overflow-hidden
            flex
            flex-col
            flex-1
            min-h-0
          "
        >
          {/* ================= TOPO DO CARD ================= */}
          <div className="p-4 md:p-6 border-b border-slate-100 shrink-0">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <h2 className="text-base md:text-lg font-bold text-slate-800">
                  Vendas cadastradas
                </h2>

                <p className="text-xs md:text-sm text-slate-400 mt-1">
                  Consulte, edite ou acompanhe suas vendas
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
                  placeholder="Pesquisar venda..."
                  value={busca}
                  onChange={(e) => setBusca(e.target.value)}
                  className="
                    h-9
                    w-full
                    pl-10
                    pr-4
                    rounded-xl
                    bg-slate-50
                    border
                    border-slate-200
                    text-sm
                    text-slate-700
                    placeholder:text-slate-400
                    outline-none
                    transition
                    focus:bg-white
                    focus:border-blue-400
                    focus:ring-4
                    focus:ring-blue-50
                  "
                />
              </div>
            </div>
          </div>

          {/* ================= ÁREA DA TABELA ================= */}
          <div
            className="
              flex-1
              min-h-0
              overflow-auto
            "
          >
            <table className="w-full min-w-[65px] text-sm">
              {/* ================= CABEÇALHO ================= */}
              <thead className="sticky top-0 z-1">
                <tr className="bg-slate-50 border-b border-slate-100">
                  <th className="px-5 py-4 text-left text-[11px] uppercase tracking-wide font-semibold text-slate-400">
                    Data
                  </th>

                  <th className="px-5 py-4 text-left text-[11px] uppercase tracking-wide font-semibold text-slate-400">
                    Cliente
                  </th>

                  <th className="px-5 py-4 text-left text-[11px] uppercase tracking-wide font-semibold text-slate-400">
                    Valor
                  </th>

                  <th className="px-5 py-4 text-center text-[11px] uppercase tracking-wide font-semibold text-slate-400">
                    Ações
                  </th>
                </tr>
              </thead>

              {/* ================= DADOS ================= */}
              <tbody className="divide-y divide-slate-100">
                {listaFiltrada.map((r) => (
                  <tr
                    key={r.id}
                    className="group hover:bg-slate-50/70 transition-colors"
                  >
                    {/* DATA DA VENDA */}
                    <td className="px-5 py-4 whitespace-nowrap text-slate-600">
                      {formatarData(r.data)}
                    </td>

                    {/* CLIENTE */}
                    <td className="px-5 py-4">
                      <div className="font-semibold text-slate-700">
                        {r.cliente_nome || "Cliente não informado"}
                      </div>
                    </td>

                    {/* VALOR */}
                    <td className="px-5 py-4 whitespace-nowrap font-semibold text-slate-700">
                      {formatarValor(r.valor_total ?? r.valor)}
                    </td>

                    {/* AÇÕES */}
                    <td className="px-5 py-4">
                      <div className="flex items-center justify-center gap-2">
                        {/* EDITAR */}
                        <button
                          type="button"
                          onClick={() => editarReceita(r.id)}
                          className="
                            w-9
                            h-9
                            flex
                            items-center
                            justify-center
                            rounded-lg
                            bg-blue-50
                            text-blue-600
                            hover:bg-blue-600
                            hover:text-white
                            transition
                          "
                          title="Editar"
                        >
                          <Pencil size={16} />
                        </button>

                        {/* EXCLUIR */}
                        <button
                          type="button"
                          onClick={() => excluirReceita(r.id)}
                          className="
                            w-9
                            h-9
                            flex
                            items-center
                            justify-center
                            rounded-lg
                            bg-red-50
                            text-red-500
                            hover:bg-red-500
                            hover:text-white
                            transition
                          "
                          title="Excluir"
                        >
                          <Trash size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}

                {/* ================= VAZIO ================= */}
                {listaFiltrada.length === 0 && (
                  <tr>
                    <td colSpan="4" className="py-16 text-center">
                      <div className="flex flex-col items-center">
                        <div className="w-14 h-14 rounded-2xl bg-slate-100 flex items-center justify-center mb-3">
                          <Search size={24} className="text-slate-400" />
                        </div>

                        <p className="font-semibold text-slate-600">
                          Nenhuma venda encontrada
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
