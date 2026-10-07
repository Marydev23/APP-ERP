import React, { useEffect, useMemo, useState } from "react";

import { Button } from "@/components/ui/button";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

import {
  Search,
  UserPlus,
  Users,
  Pencil,
  Trash2,
  X,
  Phone,
  MapPin,
  BriefcaseBusiness,
  CalendarDays,
  DollarSign,
} from "lucide-react";

function Funcionarios() {
  const [nome, setNome] = useState("");
  const [cargo, setCargo] = useState("");
  const [endereco, setEndereco] = useState("");
  const [telefone, setTelefone] = useState("");
  const [data, setData] = useState("");
  const [valorSalario, setValorSalario] = useState("");
  const [status, setStatus] = useState("ATIVO");

  const [listaFuncionario, setListaFuncionario] = useState([]);
  const [editandoId, setEditandoId] = useState(null);
  const [modalAberto, setModalAberto] = useState(false);
  const [busca, setBusca] = useState("");
  const [carregando, setCarregando] = useState(false);

  // ===============================
  // BUSCAR FUNCIONÁRIOS
  // ===============================

  async function buscarFuncionarios() {
    try {
      setCarregando(true);

      const response = await fetch("http://localhost:5000/funcionarios");

      const dados = await response.json();

      if (!response.ok) {
        console.error("Erro ao buscar funcionários:", dados);
        setListaFuncionario([]);
        return;
      }

      if (Array.isArray(dados)) {
        setListaFuncionario(dados);
      } else if (Array.isArray(dados.funcionarios)) {
        setListaFuncionario(dados.funcionarios);
      } else {
        setListaFuncionario([]);
      }
    } catch (error) {
      console.error("Erro de conexão:", error);
      setListaFuncionario([]);
    } finally {
      setCarregando(false);
    }
  }

  useEffect(() => {
    buscarFuncionarios();
  }, []);

  // ===============================
  // BUSCA
  // ===============================

  const funcionariosFiltrados = useMemo(() => {
    const termo = busca.toLowerCase().trim();

    if (!termo) {
      return listaFuncionario;
    }

    return listaFuncionario.filter((f) => {
      return (
        String(f.Nome || "")
          .toLowerCase()
          .includes(termo) ||
        String(f.Cargo || "")
          .toLowerCase()
          .includes(termo) ||
        String(f.Telefone || "")
          .toLowerCase()
          .includes(termo)
      );
    });
  }, [listaFuncionario, busca]);

  // ===============================
  // SALVAR
  // ===============================

  async function salvarFuncionario(e) {
    e.preventDefault();

    if (
      !nome.trim() ||
      !cargo.trim() ||
      !telefone.trim() ||
      !endereco.trim() ||
      !valorSalario
    ) {
      alert("Preencha todos os campos obrigatórios.");
      return;
    }

    try {
      const payload = {
        Nome: nome,
        Cargo: cargo,
        Telefone: telefone,
        Endereco: endereco,
        Valor_salario: Number(valorSalario),
        Data_admissao: data,
        Status: status,
      };

      const url = editandoId
        ? `http://localhost:5000/funcionarios/${editandoId}`
        : "http://localhost:5000/funcionarios";

      const method = editandoId ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const result = await response.json();

      if (!response.ok) {
        alert(result.erro || "Erro ao salvar funcionário.");
        return;
      }

      limparFormulario();
      setModalAberto(false);
      buscarFuncionarios();
    } catch (error) {
      console.error(error);
      alert("Erro de conexão com o servidor.");
    }
  }

  // ===============================
  // EDITAR
  // ===============================

  function editarFuncionario(f) {
    setEditandoId(f.ID);
    setNome(f.Nome || "");
    setCargo(f.Cargo || "");
    setTelefone(f.Telefone || "");
    setEndereco(f.Endereco || "");
    setValorSalario(f.Valor_salario || "");
    setData(f.Data_admissao || "");
    setStatus(f.Status || "ATIVO");
    setModalAberto(true);
  }

  // ===============================
  // LIMPAR
  // ===============================

  function limparFormulario() {
    setEditandoId(null);
    setNome("");
    setCargo("");
    setEndereco("");
    setTelefone("");
    setValorSalario("");
    setData("");
    setStatus("ATIVO");
  }

  // ===============================
  // EXCLUIR
  // ===============================

  async function excluirFuncionario(id) {
    if (!window.confirm("Deseja realmente excluir este funcionário?")) {
      return;
    }

    try {
      const response = await fetch(`http://localhost:5000/funcionarios/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        alert("Erro ao excluir funcionário.");
        return;
      }

      buscarFuncionarios();
    } catch (error) {
      console.error(error);
      alert("Erro de conexão com o servidor.");
    }
  }

  // ===============================
  // SALÁRIO
  // ===============================

  function formatarSalario(valor) {
    return Number(valor || 0).toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL",
    });
  }

  return (
    <div className="sm:ml-64 min-h-screen bg-slate-100 p-4 sm:p-6 lg:p-8">
      {/* ===============================
          CABEÇALHO
      =============================== */}

      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-slate-900 text-white">
            <Users size={22} />
          </div>

          <div>
            <h1 className="text-2xl font-bold text-slate-900">Funcionários</h1>

            <p className="text-sm text-slate-500">
              Cadastre e gerencie os funcionários
            </p>
          </div>
        </div>

        <Button
          onClick={() => {
            limparFormulario();
            setModalAberto(true);
          }}
          className="h-11 w-full rounded-xl bg-slate-900 px-5 font-medium text-white shadow-sm transition hover:bg-slate-800 sm:w-auto"
        >
          <UserPlus size={18} className="mr-2" />
          Cadastrar funcionário
        </Button>
      </div>

      {/* ===============================
          LISTA
      =============================== */}

      <Card className="overflow-hidden rounded-2xl border-0 shadow-sm">
        <CardHeader className="border-b border-slate-100 bg-white px-5 py-5 sm:px-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <CardTitle className="text-lg font-bold text-slate-900">
                Lista de funcionários
              </CardTitle>

              <p className="mt-1 text-sm text-slate-500">
                Funcionários cadastrados no sistema
              </p>
            </div>

            {/* PESQUISA */}

            <div className="relative w-full sm:w-72">
              <Search
                size={18}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
              />

              <input
                type="text"
                placeholder="Buscar funcionário..."
                value={busca}
                onChange={(e) => setBusca(e.target.value)}
                className="h-10 w-full rounded-xl border border-slate-200 bg-slate-50 pl-10 pr-4 text-sm text-slate-700 outline-none transition focus:border-slate-400 focus:bg-white"
              />
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-0">
          {/* ===============================
              DESKTOP
          =============================== */}

          <div className="hidden overflow-x-auto md:block">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50">
                  <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Nome
                  </th>

                  <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Cargo
                  </th>

                  <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Telefone
                  </th>

                  <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Salário
                  </th>

                  <th className="px-6 py-4 text-center text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Status
                  </th>

                  <th className="px-6 py-4 text-center text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Ações
                  </th>
                </tr>
              </thead>

              <tbody>
                {funcionariosFiltrados.map((f) => (
                  <tr
                    key={f.ID}
                    className="border-b border-slate-100 transition hover:bg-slate-50"
                  >
                    {/* NOME */}

                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-slate-900 text-sm font-bold text-white">
                          {String(f.Nome || "?")
                            .charAt(0)
                            .toUpperCase()}
                        </div>

                        <div>
                          <p className="font-semibold text-slate-800">
                            {f.Nome}
                          </p>

                          <p className="text-xs text-slate-400">ID #{f.ID}</p>
                        </div>
                      </div>
                    </td>

                    {/* CARGO */}

                    <td className="px-6 py-4 text-sm text-slate-600">
                      {f.Cargo}
                    </td>

                    {/* TELEFONE */}

                    <td className="px-6 py-4 text-sm text-slate-600">
                      {f.Telefone}
                    </td>

                    {/* SALÁRIO */}

                    <td className="px-6 py-4 text-sm font-semibold text-slate-700">
                      {formatarSalario(f.Valor_salario)}
                    </td>

                    {/* STATUS */}

                    <td className="px-6 py-4 text-center">
                      <span
                        className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${
                          String(f.Status).toUpperCase() === "ATIVO"
                            ? "bg-green-100 text-green-700"
                            : "bg-slate-100 text-slate-500"
                        }`}
                      >
                        {f.Status}
                      </span>
                    </td>

                    {/* AÇÕES */}

                    <td className="px-6 py-4">
                      <div className="flex justify-center gap-2">
                        <button
                          onClick={() => editarFuncionario(f)}
                          className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-500 transition hover:bg-slate-100 hover:text-slate-900"
                          title="Editar"
                        >
                          <Pencil size={17} />
                        </button>

                        <button
                          onClick={() => excluirFuncionario(f.ID)}
                          className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-500 transition hover:bg-red-50 hover:text-red-600"
                          title="Excluir"
                        >
                          <Trash2 size={17} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* ===============================
              MOBILE
          =============================== */}

          <div className="space-y-3 p-4 md:hidden">
            {funcionariosFiltrados.map((f) => (
              <div
                key={f.ID}
                className="rounded-2xl border border-slate-100 bg-white p-4 shadow-sm"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex min-w-0 items-center gap-3">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-slate-900 font-bold text-white">
                      {String(f.Nome || "?")
                        .charAt(0)
                        .toUpperCase()}
                    </div>

                    <div className="min-w-0">
                      <h3 className="truncate font-semibold text-slate-900">
                        {f.Nome}
                      </h3>

                      <p className="truncate text-sm text-slate-500">
                        {f.Cargo}
                      </p>
                    </div>
                  </div>

                  <span
                    className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-semibold ${
                      String(f.Status).toUpperCase() === "ATIVO"
                        ? "bg-green-100 text-green-700"
                        : "bg-slate-100 text-slate-500"
                    }`}
                  >
                    {f.Status}
                  </span>
                </div>

                <div className="mt-4 grid grid-cols-2 gap-3 border-t border-slate-100 pt-4">
                  <div>
                    <p className="text-xs text-slate-400">Telefone</p>

                    <p className="mt-1 text-sm font-medium text-slate-700">
                      {f.Telefone || "-"}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs text-slate-400">Salário</p>

                    <p className="mt-1 text-sm font-semibold text-slate-700">
                      {formatarSalario(f.Valor_salario)}
                    </p>
                  </div>
                </div>

                <div className="mt-4 flex gap-2">
                  <button
                    onClick={() => editarFuncionario(f)}
                    className="flex h-10 flex-1 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white text-sm font-medium text-slate-700 transition hover:bg-slate-50"
                  >
                    <Pencil size={16} />
                    Editar
                  </button>

                  <button
                    onClick={() => excluirFuncionario(f.ID)}
                    className="flex h-10 flex-1 items-center justify-center gap-2 rounded-xl border border-red-100 bg-white text-sm font-medium text-red-600 transition hover:bg-red-50"
                  >
                    <Trash2 size={16} />
                    Excluir
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* ===============================
              LISTA VAZIA
          =============================== */}

          {!carregando && funcionariosFiltrados.length === 0 && (
            <div className="px-6 py-16 text-center">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-slate-100 text-slate-400">
                <Users size={25} />
              </div>

              <h3 className="mt-4 font-semibold text-slate-700">
                Nenhum funcionário encontrado
              </h3>

              <p className="mt-1 text-sm text-slate-400">
                {busca
                  ? "Tente pesquisar por outro nome ou cargo."
                  : "Clique em cadastrar funcionário para começar."}
              </p>
            </div>
          )}

          {carregando && (
            <div className="px-6 py-16 text-center text-sm text-slate-400">
              Carregando funcionários...
            </div>
          )}
        </CardContent>
      </Card>

      {/* ===============================
          MODAL DE CADASTRO
      =============================== */}

      {modalAberto && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-sm">
          <form
            onSubmit={salvarFuncionario}
            className="max-h-[95vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white shadow-2xl"
          >
            {/* CABEÇALHO */}

            <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4 sm:px-6">
              <div>
                <h2 className="text-xl font-bold text-slate-900">
                  {editandoId ? "Editar funcionário" : "Cadastrar funcionário"}
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  Informe os dados do funcionário
                </p>
              </div>

              <button
                type="button"
                onClick={() => {
                  limparFormulario();
                  setModalAberto(false);
                }}
                className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
              >
                <X size={20} />
              </button>
            </div>

            {/* CAMPOS */}

            <div className="space-y-5 p-5 sm:p-6">
              {/* NOME */}

              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">
                  Nome completo *
                </label>

                <div className="relative">
                  <Users
                    size={18}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                  />

                  <input
                    type="text"
                    value={nome}
                    onChange={(e) => setNome(e.target.value)}
                    placeholder="Digite o nome completo"
                    className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50 pl-10 pr-4 text-sm text-slate-700 outline-none transition focus:border-slate-400 focus:bg-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                {/* CARGO */}

                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-700">
                    Cargo *
                  </label>

                  <div className="relative">
                    <BriefcaseBusiness
                      size={18}
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                    />

                    <input
                      type="text"
                      value={cargo}
                      onChange={(e) => setCargo(e.target.value)}
                      placeholder="Ex.: Vendedor"
                      className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50 pl-10 pr-4 text-sm text-slate-700 outline-none transition focus:border-slate-400 focus:bg-white"
                    />
                  </div>
                </div>

                {/* TELEFONE */}

                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-700">
                    Telefone *
                  </label>

                  <div className="relative">
                    <Phone
                      size={18}
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                    />

                    <input
                      type="text"
                      value={telefone}
                      onChange={(e) => setTelefone(e.target.value)}
                      placeholder="(00) 00000-0000"
                      className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50 pl-10 pr-4 text-sm text-slate-700 outline-none transition focus:border-slate-400 focus:bg-white"
                    />
                  </div>
                </div>

                {/* ENDEREÇO */}

                <div className="sm:col-span-2">
                  <label className="mb-2 block text-sm font-medium text-slate-700">
                    Endereço *
                  </label>

                  <div className="relative">
                    <MapPin
                      size={18}
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                    />

                    <input
                      type="text"
                      value={endereco}
                      onChange={(e) => setEndereco(e.target.value)}
                      placeholder="Rua, número, bairro..."
                      className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50 pl-10 pr-4 text-sm text-slate-700 outline-none transition focus:border-slate-400 focus:bg-white"
                    />
                  </div>
                </div>

                {/* DATA */}

                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-700">
                    Data de admissão
                  </label>

                  <div className="relative">
                    <CalendarDays
                      size={18}
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                    />

                    <input
                      type="date"
                      value={data}
                      onChange={(e) => setData(e.target.value)}
                      className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50 pl-10 pr-4 text-sm text-slate-700 outline-none transition focus:border-slate-400 focus:bg-white"
                    />
                  </div>
                </div>

                {/* SALÁRIO */}

                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-700">
                    Salário *
                  </label>

                  <div className="relative">
                    <DollarSign
                      size={18}
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                    />

                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      value={valorSalario}
                      onChange={(e) => setValorSalario(e.target.value)}
                      placeholder="0,00"
                      className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50 pl-10 pr-4 text-sm text-slate-700 outline-none transition focus:border-slate-400 focus:bg-white"
                    />
                  </div>
                </div>

                {/* STATUS */}

                <div className="sm:col-span-2">
                  <label className="mb-2 block text-sm font-medium text-slate-700">
                    Status
                  </label>

                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value)}
                    className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 text-sm text-slate-700 outline-none transition focus:border-slate-400 focus:bg-white"
                  >
                    <option value="ATIVO">Ativo</option>
                    <option value="INATIVO">Inativo</option>
                  </select>
                </div>
              </div>
            </div>

            {/* BOTÕES */}

            <div className="flex flex-col-reverse gap-3 border-t border-slate-100 bg-slate-50 px-5 py-4 sm:flex-row sm:justify-end sm:px-6">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  limparFormulario();
                  setModalAberto(false);
                }}
                className="h-11 rounded-xl border-slate-200 bg-white px-6 font-medium text-slate-700 hover:bg-slate-100"
              >
                Cancelar
              </Button>

              <Button
                type="submit"
                className="h-11 rounded-xl bg-slate-900 px-7 font-medium text-white shadow-sm transition hover:bg-slate-800"
              >
                {editandoId ? "Atualizar funcionário" : "Cadastrar funcionário"}
              </Button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}

export default Funcionarios;
