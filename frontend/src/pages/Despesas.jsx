import { useEffect, useState, useMemo } from "react";
import { CardContent, CardTitle } from "@/components/ui/card";
import {
  Pencil,
  Trash,
  Wallet,
  CalendarClock,
  CircleCheck,
  Search,
  CircleDollarSign,
} from "lucide-react";

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

  const statusColors = {
    "A pagar": "text-yellow-600",
    "Vence hoje": "text-blue-600",
    Atrasado: "text-red-600",
    Pago: "text-green-600",
  };

  async function carregarDespesas() {
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/despesas`);
      const data = await res.json();
      setListaDespesas(data);
    } catch (err) {
      alert("Erro ao carregar despesas: " + err.message);
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

    if (vencimento.getTime() === hoje.getTime()) return "Vence hoje";
    if (vencimento > hoje.getTime()) return "A pagar";

    return "Atrasado";
  }

  async function salvarDespesa(e) {
    e.preventDefault();

    if (!descricao || !valor || !data || !categoria) {
      alert("Preencha todos os campos obrigatórios");
      return;
    }

    const payload = {
      Valor: Number(valor),
      DataPagamento: null,
      DataVencimento: data,
      Nome: cliente,
      Descricao: descricao,
      Status: calcularStatus(data),
      CategoriaID: categoria || null,
    };

    try {
      const res = await fetch(
        editingId ? `${API_URL}/despesas/${editingId}` : `${API_URL}/despesas`,
        {
          method: editingId ? "PUT" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        },
      );

      const data = await res.json();
      if (!res.ok) throw new Error(data.erro || "Erro ao salvar despesa");

      limparFormulario();
      carregarDespesas();
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
      await fetch(`${API_URL}/despesas/${id}`, { method: "DELETE" });
      carregarDespesas();
    } catch (err) {
      alert(err.message);
    }
  }

  async function marcarComoPago(despesa) {
    const hoje = new Date().toISOString().split("T")[0]; // yyyy-mm-dd
    try {
      const res = await fetch(`${API_URL}/despesas/${despesa.ID}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...despesa,
          DataPagamento: hoje,
          Status: "Pago",
        }),
      });
      if (!res.ok) throw new Error("Erro ao marcar como pago");
      carregarDespesas();
    } catch (err) {
      alert(err.message);
    }
  }

  // ..................................................................... FILTRO DE BUSCA
  const despesasFiltradas = useMemo(() => {
    const filtradas = listaDespesas.filter(
      (d) =>
        d.Descricao?.toLowerCase().includes(busca.toLowerCase()) ||
        d.CategoriaID?.toLowerCase().includes(busca.toLowerCase()) ||
        d.Nome?.toLowerCase().includes(busca.toLowerCase()),
    );

    return filtradas.sort((a, b) => {
      const statusA = a.Status || calcularStatus(a.DataVencimento);
      const statusB = b.Status || calcularStatus(b.DataVencimento);

      if (statusA === "Pago" && statusB !== "Pago") return 1;
      if (statusA !== "Pago" && statusB === "Pago") return -1;

      return 0;
    });
  }, [listaDespesas, busca]);

  // ................................................................CÁLCULOS DOS CARDS
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
    <div className="sm:ml-64 p-6">
      <div className="max-w-7xl mx-auto p-3 space-y-6 ">
        <CardContent>
          <div className="flex items-center justify-between ">
            <div className="space-y-1 ">
              <div className="flex items-center gap-3 ">
                <Wallet className="w-8 h-8 text-green-600" />
                <CardTitle className="text-3xl font-semibold text-gray-800 tracking-tight">
                  Gestão de Pagamentos
                </CardTitle>
              </div>

              <p className="text-gray-600 text-sm font-light">
                Controle e acompanhe todos os seus pagamentos
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
                onClick={() => {
                  limparFormulario();
                  setOpenModal(true);
                }}
                className="w-40 bg-green-600 hover:bg-green-700 text-white text-xs font-medium py-2 rounded-r-lg border-l-0 transition"
              >
                + Nova Despesa
              </button>
            </div>
          </div>
        </CardContent>

        {/*                                         .........................CARDS */}
        <CardContent className="p-0">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-red-50 p-10 rounded-xl shadow flex items-center gap-4">
              <Wallet className="w-10 h-10 text-red-700" />
              <div>
                <p className="text-sm">Total Despesas</p>
                <p className="text-2xl font-bold text-red-600">
                  {formatBRL(totalDespesas)}
                </p>
              </div>
            </div>

            <div className="bg-yellow-50 p-10 rounded-xl shadow flex items-center gap-4">
              <CalendarClock className="w-10 h-10 text-yellow-700" />
              <div>
                <p className="text-sm">A Vencer</p>
                <p className="text-2xl font-bold text-yellow-600">
                  {formatBRL(totalAVencer)}
                </p>
              </div>
            </div>

            <div className="bg-green-50 p-10 rounded-xl shadow flex items-center gap-4">
              <CircleDollarSign className="w-10 h-10 text-green-700" />
              <div>
                <p className="text-sm">Pagas</p>
                <p className="text-2xl font-bold text-green-600">
                  {formatBRL(totalPagas)}
                </p>
              </div>
            </div>
          </div>
        </CardContent>
        {/* ................................................................FORMULARIO */}
        {openModal && (
          <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-20">
            <form
              onSubmit={salvarDespesa}
              className="relative bg-slate-50 w-[750px] max-w-[95%] rounded-2xl p-10 shadow-xl"
            >
              <button
                type="button"
                onClick={() => setOpenModal(false)}
                className="absolute top-3 right-4 text-gray-500 hover:text-gray-800 text-lg"
              >
                ✕
              </button>

              <CardTitle className="text-x2 font-semibold mb-5 font-sans">
                {editingId ? "Editar Pagamento" : "Registrar Novo Pagamento"}
              </CardTitle>

              <div className="grid grid-cols-12 gap-5">
                <div className="col-span-12 md:col-span-6">
                  <label className="text-sm font-medium text-slate-700">
                    Descrição
                  </label>

                  <input
                    className="w-full h-10 border border-slate-300 rounded-lg px-3 mt-1 focus:ring-2 focus:ring-green-400 focus:outline-none"
                    value={descricao}
                    onChange={(e) => setDescricao(e.target.value)}
                  />
                </div>

                <div className="col-span-6 md:col-span-3">
                  <label className="text-sm font-medium text-slate-700">
                    Valor à pagar
                  </label>

                  <input
                    type="number"
                    step="0.01"
                    className="w-full h-10 border border-slate-300 rounded-lg px-3 mt-1 focus:ring-2 focus:ring-green-400 focus:outline-none"
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
                    className="w-full h-10 border border-slate-300 rounded-lg px-3 mt-1 focus:ring-2 focus:ring-green-400 focus:outline-none"
                    value={categoria}
                    onChange={(e) => setCategoria(e.target.value)}
                  >
                    <option value="">Selecione</option>
                    <option value="Contabilidade">Contabilidade</option>
                    <option value="Matéria-Prima">Matéria-Prima</option>
                    <option value="Funcionário">Funcionário</option>
                    <option value="Imposto">Imposto</option>
                    <option value="Retirada de Sócio">Retirada de Sócio</option>
                    <option value="Gasolina">Gasolina</option>
                    <option value="Energia/Água/Aluguel">
                      Energia/Água/Aluguel
                    </option>
                    <option value="Frete">Frete</option>
                    <option value="Equipamento">Equipamento</option>
                    <option value="Outros">Outros</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-12 gap-5 mt-4">
                <div className="col-span-12 md:col-span-6">
                  <label className="text-sm font-medium text-slate-700">
                    Nome
                  </label>

                  <input
                    className="w-full h-10 border border-slate-300 rounded-lg px-3 mt-1 focus:ring-2 focus:ring-green-400 focus:outline-none"
                    value={cliente}
                    onChange={(e) => setCliente(e.target.value)}
                  />
                </div>

                <div className="col-span-6 md:col-span-3">
                  <label className="text-sm font-medium text-slate-700">
                    Data de Vencimento
                  </label>

                  <input
                    type="date"
                    className="w-full h-9 border border-slate-300 rounded-lg px-3 mt-1 focus:ring-2 focus:ring-green-400 focus:outline-none"
                    value={data}
                    onChange={(e) => setData(e.target.value)}
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-5">
                <button
                  type="submit"
                  className="bg-gradient-to-r from-green-600 to-green-500 hover:opacity-90 text-white font-semibold h-10 px-6 rounded-lg transition"
                >
                  {editingId ? "Salvar Alterações" : "Salvar"}
                </button>

                <button
                  type="button"
                  onClick={() => setOpenModal(false)}
                  className="bg-gray-500 hover:opacity-90 text-white font-semibold h-10 px-6 rounded-lg transition"
                >
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        )}
        <div className="bg-white rounded-2xl shadow-md p-6">
          <div className="flex justify-between items-center mb-5">
            <h2 className="text-xl font-semibold text-slate-800">
              Lista de Pagamentos
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
                  <th className="p-2 text-left">Data de Pagamento</th>
                  <th className="p-2 text-left">Data de Vencimento</th>
                  <th className="p-2 text-left">Nome</th>
                  <th className="p-2 text-left">Descrição</th>
                  <th className="p-2 text-left">Valor</th>
                  <th className="p-2 text-left">Categoria</th>

                  <th className="p-2 text-left">Status</th>
                  <th className="p-2 text-left"></th>

                  <th className="p-2 text-left">Ações</th>
                </tr>
              </thead>

              <tbody>
                {despesasFiltradas.map((d) => (
                  <tr key={d.ID} className="hover:bg-slate-50">
                    <td className="p-2">{formatDateBR(d.DataPagamento)}</td>
                    <td className="p-2">{formatDateBR(d.DataVencimento)}</td>
                    <td className="p-2">{d.Nome}</td>
                    <td className="p-2">{d.Descricao}</td>
                    <td className="p-2">{formatBRL(d.Valor)}</td>
                    <td className="p-2">{d.CategoriaID || "Sem Categoria"}</td>

                    <td className="p-2">
                      <div
                        className={`flex items-center gap-1 font-semibold ${statusColors[d.Status || calcularStatus(d.DataVencimento)]}`}
                      >
                        {d.Status === "Em aberto" && <LinkIcon size={14} />}
                        {d.Status || calcularStatus(d.DataVencimento)}
                      </div>
                    </td>
                    <td className="p-2">
                      {(d.Status || calcularStatus(d.DataVencimento)) !==
                      "Pago" ? (
                        <button
                          onClick={() => marcarComoPago(d)}
                          className="bg-green-600 hover:bg-green-700 text-white text-xs px-3 py-1 rounded-md"
                        >
                          Pagar
                        </button>
                      ) : (
                        <CircleCheck className="text-green-600" size={18} />
                      )}
                    </td>

                    <td className="p-2 flex gap-2 items-center">
                      <Pencil
                        size={16}
                        className="cursor-pointer"
                        onClick={() => editarDespesa(d)}
                      />

                      <Trash
                        size={16}
                        className="cursor-pointer"
                        onClick={() => excluirDespesa(d.ID)}
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
