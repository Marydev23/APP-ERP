import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import { ArrowBigUp, TrendingUp, ArrowBigDown } from "lucide-react";
import ChartGrafico from "../components/ChartGrafico";
import ChartOverview from "../components/ChartOverview";
import { useEffect, useState } from "react";

function Dashboard() {
  const [receitas, setReceitas] = useState(0);
  const [despesas, setDespesas] = useState(0);
  const [periodo, setPeriodo] = useState(30);
  const saldo = receitas - despesas;
  const formatBRL = (valor) => {
    return valor.toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL",
    });
  };

  useEffect(() => {
    async function carregarDados() {
      try {
        const resReceitas = await fetch("http://localhost:5000/receitas");
        const dadosReceitas = await resReceitas.json();

        const resDespesas = await fetch("http://localhost:5000/despesas");
        const dadosDespesas = await resDespesas.json();

        const hoje = new Date();
        const inicio = new Date();
        inicio.setDate(hoje.getDate() - periodo);

        const receitasPagas = dadosReceitas.filter(
          (item) => item.Status === "Pago" && new Date(item.Data) >= inicio,
        );

        const despesasPagas = dadosDespesas.filter(
          (item) =>
            item.Status === "Pago" &&
            new Date(item.DataPagamento || item.DataVencimento) >= inicio,
        );

        const totalReceitas = receitasPagas.reduce(
          (acc, item) => acc + Number(item.ValorTotal || item.Valor),
          0,
        );

        const totalDespesas = despesasPagas.reduce(
          (acc, item) => acc + Number(item.Valor),
          0,
        );

        setReceitas(totalReceitas);
        setDespesas(totalDespesas);
      } catch (error) {
        console.error("Erro ao carregar dados:", error);
      }
    }

    carregarDados();
  }, [periodo]);

  const usuario = JSON.parse(localStorage.getItem("usuario"));

  const hora = new Date().getHours();

  let saudacao = "Olá";

  if (hora < 12) {
    saudacao = "Bom dia";
  } else if (hora < 18) {
    saudacao = "Boa tarde";
  } else {
    saudacao = "Boa noite";
  }

  const dataHoje = new Date().toLocaleDateString("pt-BR", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });

  return (
    <div className="bg-white ">
      <main className="sm:ml-64 px-6 pt-2 max-w-7xl mx-auto">
        <div className="mb-3">
          <h1 className="text-xl font-bold text-gray-800">
            {saudacao}, {usuario?.Nome} ☀️
          </h1>

          <p className="text-gray-500 text-sm capitalize">Hoje é {dataHoje}</p>
        </div>

        <section className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold text-gray-800">
            Visão geral do fluxo de caixa
          </h1>

          <select
            value={periodo}
            onChange={(e) => setPeriodo(Number(e.target.value))}
            className="border rounded-lg px-3 py-2 text-sm bg-white shadow-sm"
          >
            <option value="30">30 dias</option>
            <option value="1">Hoje</option>
            <option value="7">7 dias</option>
            <option value="90">3 meses</option>
            <option value="365">1 ano</option>
          </select>
        </section>
        <section className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          <Card className="bg-gradient-to-br from-teal-400 to-teal-500 shadow-md border-none rounded-xl hover:scale-[1.02] transition">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <div>
                <CardTitle className="text-sm font-medium text-white/90">
                  Entradas
                </CardTitle>

                <CardDescription className="text-white/80 text-xs">
                  Total vendas 30 dias
                </CardDescription>
              </div>

              <div className="bg-white/20 p-2 rounded-lg">
                <ArrowBigUp className="w-5 h-5 text-white" />
              </div>
            </CardHeader>

            <CardContent>
              <p className="text-3xl font-bold text-white tracking-tight">
                {formatBRL(receitas)}
              </p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-red-500 to-red-600 shadow-md border-none rounded-xl hover:scale-[1.02] transition">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <div>
                <CardTitle className="text-sm font-medium text-white/90">
                  Saídas
                </CardTitle>

                <CardDescription className="text-white/80 text-xs">
                  Gastos 30 dias
                </CardDescription>
              </div>

              <div className="bg-white/20 p-2 rounded-lg">
                <ArrowBigDown className="w-5 h-5 text-white" />
              </div>
            </CardHeader>

            <CardContent>
              <p className="text-3xl font-bold text-white tracking-tight">
                {formatBRL(despesas)}
              </p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-blue-600 to-blue-500 shadow-md border-none rounded-xl hover:scale-[1.02] transition">
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
              <p className="text-3xl font-bold text-white tracking-tight">
                {formatBRL(saldo)}
              </p>
            </CardContent>
          </Card>
        </section>
        <section className="mt-6 grid grid-cols-1 lg:grid-cols-2 gap-6">
          <ChartGrafico />
          <ChartOverview />
        </section>
      </main>
    </div>
  );
}

export default Dashboard;
