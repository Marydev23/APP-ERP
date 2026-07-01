import { useState, useEffect } from "react";
import { Card, CardTitle, CardContent } from "@/components/ui/card";
import {
  Pencil,
  Trash,
  LinkIcon,
  Search,
  Wallet,
  FileText,
} from "lucide-react";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

export default function Receitas() {
  const [descricao, setDescricao] = useState("");
  const [valor, setValor] = useState("");
  const [data, setData] = useState("");
  const [formaPagamento, setFormaPagamento] = useState("");
  const [categoria, setCategoria] = useState("");
  const [parcelas, setParcelas] = useState("");
  const [dataRecebimento, setDataRecebimento] = useState("");
  const [cliente, setCliente] = useState("");
  const [busca, setBusca] = useState("");
  const [desconto, setDesconto] = useState("");
  const [status, setStatus] = useState("");

  const [listaReceitas, setListaReceitas] = useState([]);
  const [editandoId, setEditandoId] = useState(null);

  const mostrarInput =
    formaPagamento === "Cartão de crédito" ||
    formaPagamento === "Cartão de débito" ||
    formaPagamento === "Boleto";

  const tipoInput = () => {
    if (formaPagamento === "Cartão de débito") return "debito";
    if (formaPagamento === "Cartão de crédito") return "credito";
    if (formaPagamento === "Boleto") return "boleto";
    return null;
  };

  async function carregarReceitas() {
    const res = await fetch("http://localhost:5000/receitas");
    const dados = await res.json();
    setListaReceitas(dados);
  }

  useEffect(() => {
    carregarReceitas();
  }, []);

  useEffect(() => {
    const fetchReceitas = async () => {
      const res = await fetch(`http://localhost:5000/receitas?busca=${busca}`);
      const data = await res.json();
      setListaReceitas(data);
    };

    fetchReceitas();
  }, [busca]);

  async function salvarReceita(e) {
    e.preventDefault();

    if (!descricao || !valor || !data || !categoria || !formaPagamento) {
      alert("Preencha todos os campos obrigatórios");
      return;
    }

    const payload = {
      Descricao: descricao,
      Valor: parseFloat(valor.replace(",", ".")) || 0,
      Data: data,
      Forma_pagamento: formaPagamento,
      CategoriaID: categoria || null,
      Parcelas:
        tipoInput() === "credito"
          ? parcelas
            ? Number(parcelas)
            : null
          : tipoInput() === "debito"
            ? 1
            : null,
      DataRecebimento:
        formaPagamento === "Boleto" ? dataRecebimento || data : data,
      Cliente: cliente || null,
    };

    const url = editandoId
      ? `http://localhost:5000/receitas/${editandoId}`
      : "http://localhost:5000/receitas";

    const method = editandoId ? "PUT" : "POST";

    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    const result = await res.json();

    if (!res.ok) {
      alert(result.erro || "Erro ao salvar");
      return;
    }

    alert(result.mensagem);
    limparFormulario();
    carregarReceitas();
  }

  function editarReceita(r) {
    setDescricao(r.Descricao || "");

    setValor(r.Valor ? Number(r.Valor).toFixed(2) : "");
    setData(r.Data || "");
    setFormaPagamento(r.Forma_pagamento || "");
    setCategoria(r.CategoriaID || "");
    setParcelas(r.Parcelas ? String(r.Parcelas) : "1");
    setDataRecebimento(r.DataRecebimento || r.Data || "");
    setCliente(r.Cliente || "");
    setDesconto(r.Desconto ? Number(r.Desconto).toFixed(2) : "0");
    setStatus(r.Status || "Pago");
    setEditandoId(r.ID);
  }

  async function excluirReceita(id) {
    if (!confirm("Deseja excluir?")) return;
    await fetch(`http://localhost:5000/receitas/${id}`, { method: "DELETE" });
    carregarReceitas();
  }

  function limparFormulario() {
    setDescricao("");
    setValor("");
    setData("");
    setFormaPagamento("");
    setCategoria("");
    setParcelas("");
    setDataRecebimento("");
    setCliente("");
    setDesconto("");
    setStatus("");

    setEditandoId("");
  }

  function calcularStatus(r) {
    if (r.Status && r.Status.toLowerCase() === "pago") return "Pago";

    const dataVencimentoStr = r.DataRecebimento || r.Data;
    if (!dataVencimentoStr) return "Sem Data";

    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0);

    const vencimento = new Date(dataVencimentoStr + "T00:00:00");
    if (isNaN(vencimento.getTime())) return "Data Inválida";

    if (r.Forma_pagamento === "Boleto") {
      if (vencimento.getTime() > hoje.getTime()) return "A receber";
      if (vencimento.getTime() === hoje.getTime()) return "Vence hoje";
      return "Atrasado";
    }

    return "Recebido";
  }
  const totalReceitas = listaReceitas.reduce(
    (acc, r) => acc + Number(r.ValorTotal),
    0,
  );

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

  const listaFiltrada = listaReceitas.filter(
    (r) =>
      r.Descricao?.toLowerCase().includes(busca.toLowerCase()) ||
      r.Cliente?.toLowerCase().includes(busca.toLowerCase()),
  );

  function gerarRelatorio() {
    const doc = new jsPDF();

    const hoje = new Date();

    const trintaDiasAtras = new Date();
    trintaDiasAtras.setDate(hoje.getDate() - 30);

    const vendas30dias = listaFiltrada.filter((r) => {
      const dataVenda = new Date(r.Data);
      return dataVenda >= trintaDiasAtras && dataVenda <= hoje;
    });

    doc.setFontSize(18);
    doc.text("Relatório de Vendas - Últimos 30 dias", 14, 15);

    doc.setFontSize(10);
    doc.text(`Gerado em: ${new Date().toLocaleDateString("pt-BR")}`, 14, 22);

    const dadosTabela = vendas30dias.map((r) => [
      formatarData(r.Data),
      r.Cliente || "-",
      r.Descricao,
      r.Forma_pagamento,
      formatarValor(r.Valor),
      formatarValor(r.Desconto),
      formatarValor(r.ValorTotal),
    ]);

    autoTable(doc, {
      startY: 30,
      head: [
        [
          "Data",
          "Cliente",
          "Descrição",
          "Forma de Pagamento",
          "Valor",
          "Desconto",
          "Total",
        ],
      ],
      body: dadosTabela,
    });

    const formas = [
      "Dinheiro",
      "PIX",
      "Cartão de débito",
      "Cartão de crédito",
      "Boleto",
    ];

    const totaisPorForma = {};

    formas.forEach((f) => {
      totaisPorForma[f] = vendas30dias
        .filter((r) => r.Forma_pagamento === f)
        .reduce((acc, r) => acc + Number(r.ValorTotal || r.Valor || 0), 0);
    });

    const finalY = doc.lastAutoTable ? doc.lastAutoTable.finalY + 10 : 40;

    doc.setFontSize(12);
    doc.text("Resumo por Forma de Pagamento", 14, finalY);

    const resumoDados = formas.map((f) => [
      f,
      formatarValor(totaisPorForma[f] || 0),
    ]);

    autoTable(doc, {
      startY: finalY + 6,
      head: [["Forma de Pagamento", "Total"]],
      body: resumoDados,
      theme: "grid",
      styles: {
        fontSize: 10,
        cellPadding: 2,
        halign: "left",
      },
      headStyles: {
        fillColor: [220, 220, 220],
        textColor: 0,
        fontStyle: "bold",
      },
    });

    doc.save("relatorio_vendas_30_dias.pdf");
  }
  return (
    <div className="sm:ml-64 p-6">
      <div className="max-w-7xl mx-auto p-3 space-y-6 ">
        <CardContent>
          <div className="flex items-center justify-between ">
            <div className="space-y-1 ">
              <div className="flex items-center gap-3 ">
                <Wallet className="w-8 h-8 text-green-600" />
                <CardTitle className="text-3xl font-semibold text-gray-800 tracking-tight">
                  Gestão de Vendas
                </CardTitle>
              </div>

              <p className="text-gray-600 text-sm font-light">
                Controle e acompanhe todas as suas vendas
              </p>
            </div>

            <div className="flex">
              <select
                className="w-40 bg-gray-100 border border-gray-300 text-gray-700 text-xs font-medium py-2 rounded-l-lg hover:bg-gray-200 transition flex items-center justify-center "
                value={busca}
                onChange={(e) => setBusca(e.target.value)}
              >
                <option value=""> Período: Últimos 30 dias</option>
                <option value="Atacado"> Período: Últimos 60 dias</option>
                <option value="Varejo"> Período: Últimos 90 dias</option>
                <svg
                  className="w-4 h-4 text-gray-500"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </select>

              <button
                onClick={gerarRelatorio}
                className="w-40 flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 text-white text-xs font-medium py-2 rounded-r-lg transition"
              >
                <FileText size={16} />
                Gerar Relatório
              </button>
            </div>
          </div>
        </CardContent>

        <CardContent className="p-0">
          <form onSubmit={salvarReceita} className="w-full space-x-1">
            <CardTitle className="text-xl font-bold mb-2">
              Registrar Nova Venda
            </CardTitle>

            <div className="grid grid-cols-12 gap-4">
              <div className="col-span-12 md:col-span-5">
                <label className="text-sm font-medium text-slate-700">
                  Descrição
                </label>
                <input
                  className="w-full h-7 border border-slate-300 rounded-lg px-3 mt-1 focus:ring-2 focus:ring-green-400 focus:outline-none"
                  value={descricao}
                  onChange={(e) => setDescricao(e.target.value)}
                  placeholder="Digite a descrição da venda"
                />
              </div>

              <div className="col-span-6 md:col-span-3">
                <label className="text-sm font-medium text-slate-700">
                  Valor
                </label>
                <input
                  type="number"
                  step="0.01"
                  className="w-full h-7 border border-slate-300 rounded-lg px-3 mt-1 focus:ring-2 focus:ring-green-400 focus:outline-none"
                  value={valor}
                  onChange={(e) => setValor(e.target.value)}
                  placeholder="R$ 0,00"
                />
              </div>

              <div className="col-span-6 md:col-span-3">
                <label className="text-sm font-medium text-slate-700">
                  Categoria
                </label>
                <select
                  className="w-full h-7 border border-slate-300 rounded-lg px-3 mt-1 focus:ring-2 focus:ring-green-400 focus:outline-none"
                  value={categoria}
                  onChange={(e) => setCategoria(e.target.value)}
                >
                  <option value="">Selecione</option>
                  <option value="Atacado">Atacado</option>
                  <option value="Varejo">Varejo</option>
                </select>
              </div>
            </div>

            {/* LINHA 2 */}
            <div className="grid grid-cols-12 gap-4">
              <div className="col-span-12 md:col-span-5">
                <label className="text-sm font-medium text-slate-700">
                  Cliente
                </label>
                <input
                  className="w-full h-7 border border-slate-300 rounded-lg px-3 mt-1 focus:ring-2 focus:ring-green-400 focus:outline-none"
                  value={cliente}
                  onChange={(e) => setCliente(e.target.value)}
                  placeholder="Nome do cliente"
                />
              </div>

              <div className="col-span-6 md:col-span-3">
                <label className="text-sm font-medium text-slate-700">
                  Data
                </label>
                <input
                  type="date"
                  className="w-full h-7 border border-slate-300 rounded-lg px-3 mt-1 focus:ring-2 focus:ring-green-400 focus:outline-none"
                  value={data}
                  onChange={(e) => setData(e.target.value)}
                />
              </div>

              <div className="col-span-6 md:col-span-3">
                <label className="text-sm font-medium text-slate-700">
                  Forma de Pagamento
                </label>
                <div className="flex items-end gap-4 mt-1">
                  <select
                    className="w-48 h-7 border border-slate-300 rounded-lg px-3 focus:ring-2 focus:ring-green-400 focus:outline-none"
                    value={formaPagamento}
                    onChange={(e) => setFormaPagamento(e.target.value)}
                  >
                    <option value="">Selecione</option>
                    <option>Dinheiro</option>
                    <option>PIX</option>
                    <option>Cartão de débito</option>
                    <option>Cartão de crédito</option>
                    <option>Boleto</option>
                  </select>

                  {mostrarInput && (
                    <>
                      {tipoInput() === "debito" && (
                        <input
                          type="text"
                          value="À vista"
                          disabled
                          className="h-7 w-32 border border-slate-300 rounded-lg px-3 bg-gray-100 text-gray-700"
                        />
                      )}
                      {tipoInput() === "credito" && (
                        <select
                          value={parcelas}
                          onChange={(e) => setParcelas(e.target.value)}
                          className="h-7 w-32 border border-slate-300 rounded-lg px-3 focus:ring-2 focus:ring-green-400 focus:outline-none"
                        >
                          <option value="1">À Vista</option>
                          <option value="2">2x</option>
                          <option value="3">3x</option>
                        </select>
                      )}
                      {tipoInput() === "boleto" && (
                        <input
                          type="date"
                          value={dataRecebimento}
                          onChange={(e) => setDataRecebimento(e.target.value)}
                          className="h-7 w-28 border border-slate-300 rounded-lg px-1 focus:ring-2 focus:ring-green-400 focus:outline-none"
                        />
                      )}
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* BOTÕES */}
            <div className="flex gap-4 pt-5 text-start">
              <button
                type="submit"
                className="bg-gradient-to-r from-green-600 to-green-500 hover:opacity-90 text-white font-semibold h-8 px-5 rounded-lg transition"
              >
                {editandoId ? "Salvar Alterações" : "Salvar"}
              </button>
              <button
                type="button"
                onClick={limparFormulario}
                className="bg-gradient-to-r from-gray-500 to-gray-600 hover:opacity-90 text-white font-semibold h-8 px-5 rounded-lg transition"
              >
                Limpar
              </button>
            </div>
          </form>
        </CardContent>

        {/* CARD TABELA */}
        <div className="bg-white rounded-2xl shadow-md p-6">
          <div className="flex justify-between items-center mb-5">
            <h2 className="text-xl font-semibold text-slate-800">
              Lista de Vendas
            </h2>

            <div className="relative w-64">
              <input
                type="text"
                placeholder="Pesquisar"
                value={busca}
                onChange={(e) => setBusca(e.target.value)}
                className="h-8 w-full pl-8 pr-3 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-green-400 focus:outline-none"
              />
              <Search
                className="absolute left-2 top-1/2 -translate-y-1/2 text-slate-400"
                size={16}
              />
            </div>
          </div>

          <div className="h-[400px] overflow-y-auto border border-gray-200 rounded">
            <table className="w-full text-sm border-collapse border">
              <thead className="bg-slate-100 text-slate-600 sticky top-0 z-10">
                <tr>
                  <th className="p-2 text-left">Data Venda</th>
                  <th className="p-2 text-left">Vencimento</th>
                  <th className="p-2 text-left">Cliente</th>
                  <th className="p-2 text-left">Descrição</th>
                  <th className="p-2 text-left">Valor</th>
                  <th className="p-2 text-left">Categoria</th>
                  <th className="p-2 text-left">Forma de Pagamento</th>
                  <th className="p-2 text-left">Desconto</th>
                  <th className="p-2 text-left">Total</th>
                  <th className="p-2 text-left">Status</th>
                  <th className="p-2 text-left">Ações</th>
                </tr>
              </thead>
              <tbody>
                {listaFiltrada.map((r) => (
                  <tr key={r.ID} className="hover:bg-slate-50">
                    <td className="p-2">{formatarData(r.Data)}</td>
                    <td className="p-2">
                      {formatarData(r.DataRecebimento || r.Data)}
                    </td>
                    <td className="p-2">{r.Cliente}</td>
                    <td className="p-2">{r.Descricao}</td>
                    <td className="p-2">{formatarValor(r.Valor)}</td>
                    <td className="p-2">{r.CategoriaID || "Sem Categoria"}</td>
                    <td className="p-2">{r.Forma_pagamento}</td>
                    <td className="p-2">{formatarValor(r.Desconto)}</td>
                    <td className="p-2">{formatarValor(r.ValorTotal)}</td>
                    <td className="p-2">
                      <div
                        className={`flex items-center gap-1 font-semibold ${
                          calcularStatus(r) === "Pago"
                            ? "text-green-600"
                            : calcularStatus(r) === "A receber"
                              ? "text-yellow-600"
                              : "text-red-600"
                        }`}
                      >
                        {calcularStatus(r) === "A receber" && (
                          <LinkIcon size={14} />
                        )}
                        {calcularStatus(r)}
                      </div>
                    </td>
                    <td className="p-2 flex gap-2">
                      <Pencil
                        size={16}
                        className="cursor-pointer"
                        onClick={() => editarReceita(r)}
                      />
                      <Trash
                        size={16}
                        className="cursor-pointer"
                        onClick={() => excluirReceita(r.ID)}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
