import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Edit2, SquarePen, Trash2 } from "lucide-react";

import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "../components/ui/tooltip";

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

  // ===============================
  // BUSCAR FUNCIONÁRIOS
  // ===============================
  async function buscarFuncionarios() {
    const response = await fetch("http://localhost:5000/funcionarios");
    const dados = await response.json();
    setListaFuncionario(dados);
  }

  useEffect(() => {
    buscarFuncionarios();
  }, []);

  // ===============================
  // SALVAR / ATUALIZAR
  // ===============================
  async function salvarFuncionario(e) {
    e.preventDefault();

    if (!nome || !cargo || !telefone || !endereco || !valorSalario) {
      alert("Preencha todos os campos");
      return;
    }

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
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    const result = await response.json();

    if (!response.ok) {
      alert(result.erro || "Erro ao salvar");
      return;
    }

    alert(result.mensagem);
    limparFormulario();
    buscarFuncionarios();
    setModalAberto(false);
  }

  // ===============================
  // EDITAR
  // ===============================
  function editarFuncionario(f) {
    setEditandoId(f.ID);
    setNome(f.Nome);
    setCargo(f.Cargo);
    setTelefone(f.Telefone);
    setEndereco(f.Endereco);
    setValorSalario(f.Valor_salario);
    setData(f.Data_admissao || "");
    setStatus(f.Status);
    setModalAberto(true);
  }

  function limparFormulario() {
    setEditandoId(null);
    setNome("");
    setCargo("");
    setTelefone("");
    setEndereco("");
    setValorSalario("");
    setData("");
    setStatus("ATIVO");
  }

  // ===============================
  // EXCLUIR
  // ===============================
  async function excluirFuncionario(id) {
    if (!window.confirm("Deseja excluir este funcionário?")) return;

    const response = await fetch(`http://localhost:5000/funcionarios/${id}`, {
      method: "DELETE",
    });

    if (!response.ok) {
      alert("Erro ao excluir funcionário");
      return;
    }

    buscarFuncionarios();
  }

  return (
    <div className="sm:ml-64 p-6">
      {/* TOPO */}
      <div className="flex justify-between mb-6">
        <h1 className="text-4xl font-bold text-gray-950">
          Cadastro de Funcionários
        </h1>

        <div className="flex items-start">
          <button
            onClick={() => {
              limparFormulario();
              setModalAberto(true);
            }}
            className="
          inline-flex
          items-center
          bg-gray-900 
          hover:bg-gray-800
          text-white
          text-sm
          h-9
          px-8
          rounded-md
          leading-none
        "
          >
            Adicionar
          </button>
        </div>
      </div>

      {/* TABELA */}
      <Card className="rounded-xl shadow-sm">
        <CardContent className="p-0">
          <table className="w-full ">
            <thead>
              <tr className="bg-gray-400 text-gray-800">
                <th className="px-4 py-3 text-left font-semibold">Nome</th>
                <th className="px-4 py-3 text-left font-semibold">Função</th>
                <th className="px-4 py-3 text-left font-semibold">Salário</th>
                <th className="px-4 py-3 text-left font-semibold">Status</th>
                <th className="px-4 py-3 text-center font-semibold">Editar</th>
                <th className="px-4 py-3 text-center font-semibold">Excluir</th>
              </tr>
            </thead>

            <tbody>
              {listaFuncionario.map((f) => (
                <tr key={f.ID} className="border-b hover:bg-gray-50 transition">
                  <td className="px-4 py-3">{f.Nome}</td>
                  <td className="px-4 py-3">{f.Cargo}</td>
                  <td className="px-4 py-3">
                    R${" "}
                    {Number(f.Valor_salario).toLocaleString("pt-BR", {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}
                  </td>

                  <td className="px-4 py-3">{f.Status}</td>

                  {/* EDITAR */}
                  <td className="px-4 py-3 text-center align-middle">
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <button
                            onClick={() => editarFuncionario(f)}
                            className="
            inline-flex
            items-center
            justify-center
            p-1
            bg-transparent
            border-none
            text-gray-900
            hover:text-gray-900
            focus:outline-none
          "
                            aria-label="Editar"
                          >
                            <SquarePen size={16} />
                          </button>
                        </TooltipTrigger>
                      </Tooltip>
                    </TooltipProvider>
                  </td>

                  {/* EXCLUIR */}
                  <td className="px-4 py-3 text-center align-middle">
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <button
                            onClick={() => excluirFuncionario(f.ID)}
                            className="
                              inline-flex
            items-center
            justify-center
            p-1
            bg-transparent
            border-none
            text-gray-900
            hover:text-gray-900
            focus:outline-none
          "
                            aria-label="Excluir"
                          >
                            <Trash2 size={16} />
                          </button>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Excluir</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </td>
                </tr>
              ))}

              {listaFuncionario.length === 0 && (
                <tr>
                  <td colSpan={5} className="text-center py-16 text-gray-400">
                    Nenhum funcionário cadastrado
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </CardContent>
      </Card>

      {/* MODAL */}
      {modalAberto && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center ">
          <form
            onSubmit={salvarFuncionario}
            className="space-y-5 bg-gray-100 w-full max-w-2xl p-8 rounded-lg shadow-lg"
          >
            <CardTitle className="font-bold py-1">
              {editandoId ? "Editar Funcionário" : "Novo Funcionário"}
            </CardTitle>

            <input
              className="w-full bg-transparent border-0 border-b border-gray-500 focus:outline-none"
              placeholder="Nome"
              value={nome}
              onChange={(e) => setNome(e.target.value)}
            />

            <input
              className="w-full bg-transparent  border-0 border-b border-gray-500 focus:outline-none"
              placeholder="Cargo"
              value={cargo}
              onChange={(e) => setCargo(e.target.value)}
            />
            <input
              className="w-full bg-transparent  border-0 border-b border-gray-500 focus:outline-none"
              placeholder="Endereço"
              value={endereco}
              onChange={(e) => setEndereco(e.target.value)}
            />
            <input
              className="w-full bg-transparent  border-0 border-b border-gray-500 focus:outline-none"
              placeholder="Telefone"
              value={telefone}
              onChange={(e) => setTelefone(e.target.value)}
            />
            <input
              className="w-full bg-transparent  border-0 border-b border-gray-500 focus:outline-none"
              type="date"
              value={data}
              onChange={(e) => setData(e.target.value)}
            />
            <input
              className="w-full bg-transparent  border-0 border-b border-gray-500 focus:outline-none"
              type="number"
              placeholder="Salário"
              value={valorSalario}
              onChange={(e) => setValorSalario(e.target.value)}
            />

            <select
              className="w-full bg-transparent  border-0 border-b border-gray-500 focus:outline-none"
              value={status}
              onChange={(e) => setStatus(e.target.value)}
            >
              <option value="ATIVO">Ativo</option>
              <option value="INATIVO">Inativo</option>
            </select>

            <div className="flex gap-2">
              <Button type="submit" className="bg-green-600 flex-1">
                {editandoId ? "Atualizar" : "Salvar"}
              </Button>
              <Button
                type="button"
                variant="outline"
                className="flex-1 bg-red-600"
                onClick={() => setModalAberto(false)}
              >
                Cancelar
              </Button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}

export default Funcionarios;
