import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import {
  ArrowBigUp,
  TrendingUp,
  ArrowBigDown,
  ChevronDown,
} from "lucide-react";

import ChartGrafico from "../components/ChartGrafico";
import ChartOverview from "../components/ChartOverview";
import { useEffect, useState } from "react";

function Dashboard() {
  const [receitas, setReceitas] = useState(0);
  const [despesas, setDespesas] = useState(0);
  const [periodo, setPeriodo] = useState(30);
  const [menuPeriodo, setMenuPeriodo] = useState(false);

  // ============================================================
  // SALDO
  // ============================================================

  const saldo = receitas - despesas;

  // ============================================================
  // FORMATAÇÃO DE VALORES
  // ============================================================

  const formatBRL = (valor) => {
    return Number(valor || 0).toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL",
    });
  };

  // ============================================================
  // CARREGAR DADOS
  // ============================================================

  useEffect(() => {
    async function carregarDados() {
      try {
        const token = localStorage.getItem("access_token");

        if (!token) {
          console.error("Token de acesso não encontrado.");
          return;
        }

        const headers = {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        };

        const resReceitas = await fetch(
          `${import.meta.env.VITE_API_URL}/receitas`,
          {
            headers,
          },
        );

        if (!resReceitas.ok) {
          throw new Error(`Erro ao buscar receitas: ${resReceitas.status}`);
        }

        const dadosReceitas = await resReceitas.json();

        const resDespesas = await fetch(
          `${import.meta.env.VITE_API_URL}/despesas`,
          {
            headers,
          },
        );

        if (!resDespesas.ok) {
          throw new Error(`Erro ao buscar despesas: ${resDespesas.status}`);
        }

        const dadosDespesas = await resDespesas.json();

        // DATA ATUAL
        const hoje = new Date();
        const inicio = new Date();

        inicio.setDate(hoje.getDate() - periodo);

        // RECEITAS PAGAS
        const receitasPagas = dadosReceitas.filter((item) => {
          const status = item.Status?.toLowerCase();
          const data = new Date(item.Data);

          return status === "pago" && data >= inicio;
        });

        // DESPESAS PAGAS
        const despesasPagas = dadosDespesas.filter((item) => {
          const status = item.Status?.toLowerCase();
          const data = new Date(item.DataPagamento || item.DataVencimento);

          return status === "pago" && data >= inicio;
        });

        // TOTAL DE RECEITAS
        const totalReceitas = receitasPagas.reduce((acc, item) => {
          return acc + Number(item.ValorTotal || item.Valor || 0);
        }, 0);

        // TOTAL DE DESPESAS
        const totalDespesas = despesasPagas.reduce((acc, item) => {
          return acc + Number(item.Valor || 0);
        }, 0);

        setReceitas(totalReceitas);
        setDespesas(totalDespesas);
      } catch (error) {
        console.error("Erro ao carregar dados:", error);
      }
    }

    carregarDados();
  }, [periodo]);
  // ============================================================
  // USUÁRIO
  // ============================================================

  const usuario = JSON.parse(localStorage.getItem("usuario") || "null");

  // ============================================================
  // SAUDAÇÃO
  // ============================================================

  const hora = new Date().getHours();

  let saudacao = "Olá";

  if (hora < 12) {
    saudacao = "Bom dia";
  } else if (hora < 18) {
    saudacao = "Boa tarde";
  } else {
    saudacao = "Boa noite";
  }

  // ============================================================
  // DATA
  // ============================================================

  const dataHoje = new Date().toLocaleDateString("pt-BR", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });

  // ============================================================
  // NOME DO PERÍODO
  // ============================================================

  const nomePeriodo = {
    1: "Hoje",
    7: "7 dias",
    30: "30 dias",
    90: "3 meses",
    365: "1 ano",
  };

  // ============================================================
  // SELECIONAR PERÍODO
  // ============================================================

  const selecionarPeriodo = (valor) => {
    setPeriodo(valor);
    setMenuPeriodo(false);
  };

  return (
    <div className="w-full">
      {/* =========================================================
          MOBILE
      ========================================================= */}

      <div className="md:hidden -mx-3 -mt-20 min-h-screen bg-[#f4f7fb]">
        {/* =======================================================
            CABEÇALHO / RESUMO
        ======================================================= */}

        <section className="relative bg-[#06245c] text-white px-5 pt-8 pb-28 rounded-b-[38px]">
          <div className="flex items-center justify-between"></div>

          <div className="h-px bg-white/10 mt-5" />

          {/* USUÁRIO */}

          <div className="flex items-center gap-4 mt-7">
            <div className="w-[76px] h-[76px] shrink-0 rounded-full bg-blue-600 flex items-center justify-center shadow-lg">
              <div className="flex flex-col items-center justify-center">
                <div className="w-5 h-5 rounded-full bg-white mb-1" />

                <div className="w-10 h-5 rounded-t-full bg-white" />
              </div>
            </div>

            {/* INFORMAÇÕES */}

            <div className="min-w-0">
              <p className="text-blue-200 text-base">{saudacao},</p>

              <h1 className="text-1xl font-bold truncate">
                {usuario?.Nome || "Usuário"} 👋
              </h1>

              <p className="text-blue-200 text-xs sm:text-sm mt-1 capitalize">
                Hoje é {dataHoje}
              </p>
            </div>
          </div>

          {/* ===================================================
              TÍTULO + PERÍODO
          =================================================== */}

          <div className="mt-8 flex items-center justify-between gap-3">
            <h2 className="text-[18px] sm:text-xl font-bold leading-tight">
              Visão geral do fluxo de caixa
            </h2>

            {/* DROPDOWN */}

            <div className="relative shrink-0">
              <button
                type="button"
                onClick={() => setMenuPeriodo(!menuPeriodo)}
                className="bg-blue-600/90 hover:bg-blue-500 transition rounded-full px-4 py-2.5 flex items-center gap-2 shadow-sm"
              >
                <span className="text-xs sm:text-sm font-semibold">
                  {nomePeriodo[periodo]}
                </span>

                <ChevronDown
                  className={`w-4 h-4 transition-transform ${
                    menuPeriodo ? "rotate-180" : ""
                  }`}
                />
              </button>

              {/* MENU */}

              {menuPeriodo && (
                <div className="absolute right-0 top-full mt-2 w-32 bg-white rounded-2xl shadow-xl overflow-hidden z-50">
                  {[1, 7, 30, 90, 365].map((valor) => (
                    <button
                      key={valor}
                      type="button"
                      onClick={() => selecionarPeriodo(valor)}
                      className={`w-full text-left px-4 py-3 text-xs transition ${
                        periodo === valor
                          ? "bg-blue-50 text-blue-600 font-bold"
                          : "text-gray-700 hover:bg-gray-50"
                      }`}
                    >
                      {nomePeriodo[valor]}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* ===================================================
              SALDO
          =================================================== */}

          <div className="mt-7">
            <p className="text-blue-200 text-sm">Saldo do dia</p>

            <div className="flex items-center justify-between mt-1">
              <h2 className="text-[32px] font-bold tracking-tight">
                {formatBRL(saldo)}
              </h2>

              <div className="w-11 h-11 rounded-full bg-white/10 flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-blue-200" strokeWidth={2} />
              </div>
            </div>

            <p className="text-blue-200 text-xs mt-1">Entradas menos saídas</p>
          </div>

          {/* ===================================================
              CARDS ENTRADAS E SAÍDAS
          =================================================== */}

          <div className="grid grid-cols-2 gap-3 mt-6">
            {/* ENTRADAS */}

            <div className="bg-gradient-to-br from-teal-400 to-teal-500 rounded-[20px] p-4 text-white shadow-lg">
              <div className="flex items-center justify-between">
                <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
                  <ArrowBigUp className="w-5 h-5" strokeWidth={2.5} />
                </div>

                <span className="text-[10px] bg-white/15 px-2 py-1 rounded-full">
                  Entradas
                </span>
              </div>

              <p className="text-[11px] text-white/80 mt-4">Total recebido</p>

              <p className="font-bold text-[20px] mt-1 whitespace-nowrap">
                {formatBRL(receitas)}
              </p>
            </div>

            {/* SAÍDAS */}

            <div className="bg-gradient-to-br from-pink-500 to-red-500 rounded-[20px] p-4 text-white shadow-lg">
              <div className="flex items-center justify-between">
                <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
                  <ArrowBigDown className="w-5 h-5" strokeWidth={2.5} />
                </div>

                <span className="text-[10px] bg-white/15 px-2 py-1 rounded-full">
                  Saídas
                </span>
              </div>

              <p className="text-[11px] text-white/80 mt-4">Total gasto</p>

              <p className="font-bold text-[20px] mt-1 whitespace-nowrap">
                {formatBRL(despesas)}
              </p>
            </div>
          </div>
        </section>

        {/* =====================================================
            ÁREA DOS GRÁFICOS
        ===================================================== */}

        <section className="bg-[#f4f7fb] px-4 pt-5 pb-28">
          {/* GRÁFICOS */}

          <div className="grid grid-cols-2 gap-3">
            {/* RECEITAS X DESPESAS */}

            <div className="bg-white rounded-[22px] shadow-sm overflow-hidden">
              <div className="px-4 pt-4">
                <h3 className="text-sm font-bold text-[#17366b]">
                  Receitas x Despesas
                </h3>
              </div>

              <div className="h-[260px] overflow-hidden px-1">
                <ChartGrafico />
              </div>
            </div>

            {/* ATIVIDADE FINANCEIRA */}

            <div className="bg-white rounded-[22px] shadow-sm overflow-hidden">
              <div className="px-4 pt-4">
                <h3 className="text-sm font-bold text-[#17366b]">
                  Atividade Financeira
                </h3>
              </div>

              <div className="h-[260px] overflow-hidden px-1">
                <ChartOverview />
              </div>
            </div>
          </div>

          {/* ===================================================
              ÚLTIMAS MOVIMENTAÇÕES
          =================================================== */}

          <div className="mt-6">
            <div className="flex items-center justify-between mb-3">
              <div>
                <h2 className="text-lg font-bold text-[#17366b]">
                  Últimas movimentações
                </h2>

                <p className="text-xs text-gray-500 mt-1">
                  Acompanhe suas movimentações
                </p>
              </div>

              <TrendingUp className="w-5 h-5 text-blue-600" />
            </div>

            <div className="bg-white rounded-[22px] shadow-sm overflow-hidden">
              <ChartOverview />
            </div>
          </div>
        </section>
      </div>

      {/* =========================================================
          DESKTOP
      ========================================================= */}

      <div className="hidden md:block">
        <main className="w-full px-3 pt-2 sm:px-6 max-w-7xl mx-auto">
          {/* SAUDAÇÃO */}

          <div className="mb-3">
            <h1 className="text-xl font-bold text-gray-800">
              {saudacao}, {usuario?.Nome || "Usuário"} ☀️
            </h1>

            <p className="text-gray-500 text-sm capitalize">
              Hoje é {dataHoje}
            </p>
          </div>

          {/* TÍTULO */}

          <section className="flex items-center justify-between mb-6">
            <h1 className="text-3xl font-bold text-gray-800">
              Visão geral do fluxo de caixa
            </h1>

            <select
              value={periodo}
              onChange={(e) => setPeriodo(Number(e.target.value))}
              className="border border-gray-200 rounded-lg px-3 py-2 text-sm bg-white shadow-sm outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="30">30 dias</option>

              <option value="1">Hoje</option>

              <option value="7">7 dias</option>

              <option value="90">3 meses</option>

              <option value="365">1 ano</option>
            </select>
          </section>

          {/* CARDS */}

          <section className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {/* ENTRADAS */}

            <Card className="bg-gradient-to-br from-teal-400 to-teal-500 shadow-md border-none rounded-xl">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <div>
                  <CardTitle className="text-sm font-medium text-white/90">
                    Entradas
                  </CardTitle>

                  <CardDescription className="text-white/80 text-xs">
                    Total vendas {periodo} dias
                  </CardDescription>
                </div>

                <div className="bg-white/20 p-2 rounded-lg">
                  <ArrowBigUp className="w-5 h-5 text-white" />
                </div>
              </CardHeader>

              <CardContent>
                <p className="text-3xl font-bold text-white">
                  {formatBRL(receitas)}
                </p>
              </CardContent>
            </Card>

            {/* SAÍDAS */}

            <Card className="bg-gradient-to-br from-red-500 to-red-600 shadow-md border-none rounded-xl">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <div>
                  <CardTitle className="text-sm font-medium text-white/90">
                    Saídas
                  </CardTitle>

                  <CardDescription className="text-white/80 text-xs">
                    Gastos {periodo} dias
                  </CardDescription>
                </div>

                <div className="bg-white/20 p-2 rounded-lg">
                  <ArrowBigDown className="w-5 h-5 text-white" />
                </div>
              </CardHeader>

              <CardContent>
                <p className="text-3xl font-bold text-white">
                  {formatBRL(despesas)}
                </p>
              </CardContent>
            </Card>

            {/* SALDO */}

            <Card className="bg-gradient-to-br from-blue-600 to-blue-500 shadow-md border-none rounded-xl">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <div>
                  <CardTitle className="text-sm font-medium text-white/90">
                    Saldo em Caixa
                  </CardTitle>

                  <CardDescription className="text-white/80 text-xs">
                    Saldo Atual
                  </CardDescription>
                </div>

                <div className="bg-white/20 p-2 rounded-lg">
                  <TrendingUp className="w-5 h-5 text-white" />
                </div>
              </CardHeader>

              <CardContent>
                <p className="text-3xl font-bold text-white">
                  {formatBRL(saldo)}
                </p>
              </CardContent>
            </Card>
          </section>

          {/* ===================================================
              GRÁFICOS DESKTOP
          =================================================== */}

          <section className="mt-6 grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
              <ChartGrafico />
            </div>

            <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
              <ChartOverview />
            </div>
          </section>
        </main>
      </div>
    </div>
  );
}

export default Dashboard;
