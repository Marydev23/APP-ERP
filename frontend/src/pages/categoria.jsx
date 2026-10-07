import React, { useEffect, useState } from "react";

import { Pencil, Trash2, Plus } from "lucide-react";

function Categoria() {
  const [nome, setNome] = useState("");
  const [categorias, setCategorias] = useState([]);
  const [carregando, setCarregando] = useState(false);
  const [erro, setErro] = useState("");
  const [mensagem, setMensagem] = useState("");
  const [editandoId, setEditandoId] = useState(null);
  const [nomeEdicao, setNomeEdicao] = useState("");

  const API_URL = "http://127.0.0.1:5000";
  const token = localStorage.getItem("access_token");

  // ==========================================================
  // CARREGAR CATEGORIAS
  // ==========================================================

  const carregarCategorias = async () => {
    try {
      setErro("");

      const response = await fetch(`${API_URL}/categoria/`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const dados = await response.json();

      if (!response.ok) {
        throw new Error(dados.erro || "Erro ao carregar categorias.");
      }

      setCategorias(dados);
    } catch (error) {
      console.error(error);
      setErro(error.message);
    }
  };

  useEffect(() => {
    carregarCategorias();
  }, []);

  // ==========================================================
  // CADASTRAR CATEGORIA
  // ==========================================================

  const cadastrarCategoria = async (e) => {
    e.preventDefault();

    if (!nome.trim()) {
      setErro("Digite o nome da categoria.");
      return;
    }

    try {
      setCarregando(true);
      setErro("");
      setMensagem("");

      const response = await fetch(`${API_URL}/categoria/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          nome: nome.trim(),
        }),
      });

      const dados = await response.json();

      if (!response.ok) {
        throw new Error(dados.erro || "Erro ao cadastrar categoria.");
      }

      setNome("");
      setMensagem("Categoria cadastrada com sucesso.");

      await carregarCategorias();
    } catch (error) {
      console.error(error);
      setErro(error.message);
    } finally {
      setCarregando(false);
    }
  };

  // ==========================================================
  // EXCLUIR CATEGORIA
  // ==========================================================

  const excluirCategoria = async (id) => {
    const confirmar = window.confirm(
      "Tem certeza que deseja excluir esta categoria?",
    );

    if (!confirmar) {
      return;
    }

    try {
      setErro("");
      setMensagem("");

      const response = await fetch(`${API_URL}/categoria/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const dados = await response.json();

      if (!response.ok) {
        throw new Error(dados.erro || "Erro ao excluir categoria.");
      }

      setMensagem("Categoria excluída com sucesso.");

      await carregarCategorias();
    } catch (error) {
      console.error(error);
      setErro(error.message);
    }
  };

  // ==========================================================
  // INICIAR EDIÇÃO
  // ==========================================================

  const iniciarEdicao = (categoria) => {
    console.log("Categoria selecionada:", categoria);

    setErro("");
    setMensagem("");
    setEditandoId(categoria.id);
    setNomeEdicao(categoria.nome);
  };

  // ==========================================================
  // CANCELAR EDIÇÃO
  // ==========================================================

  const cancelarEdicao = () => {
    setEditandoId(null);
    setNomeEdicao("");
    setErro("");
  };

  // ==========================================================
  // SALVAR EDIÇÃO
  // ==========================================================

  const salvarEdicao = async (id) => {
    if (!nomeEdicao.trim()) {
      setErro("Digite o nome da categoria.");
      return;
    }

    try {
      setErro("");
      setMensagem("");

      const response = await fetch(`${API_URL}/categoria/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          nome: nomeEdicao.trim(),
        }),
      });

      const dados = await response.json();

      if (!response.ok) {
        throw new Error(dados.erro || "Erro ao atualizar categoria.");
      }

      setEditandoId(null);
      setNomeEdicao("");
      setMensagem("Categoria atualizada com sucesso.");

      await carregarCategorias();
    } catch (error) {
      console.error(error);
      setErro(error.message);
    }
  };

  // ==========================================================
  // RENDER
  // ==========================================================

  return (
    <div className="p-6">
      {/* TÍTULO */}

      <div className="mb-6">
        <h1 className="text-xl sm:text-2xl font-bold text-gray-800">
          Categorias
        </h1>

        <p className="text-sm text-gray-500 mt-1">
          Cadastre e gerencie as categorias utilizadas pela empresa.
        </p>
      </div>

      {/* ERRO */}
      {erro && (
        <div className="mb-4 p-3 rounded-lg bg-red-50 border border-red-200 text-red-600 text-sm">
          {erro}
        </div>
      )}

      {/* SUCESSO */}
      {mensagem && (
        <div className="mb-4 p-3 rounded-lg bg-green-50 border border-green-200 text-green-600 text-sm">
          {mensagem}
        </div>
      )}

      {/* CARD PRINCIPAL */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        {/* CABEÇALHO DO CARD */}
        <div className="p-4 sm:p-5 border-b border-gray-200">
          <h2 className="text-base sm:text-lg font-semibold text-gray-800">
            Categorias cadastradas
          </h2>

          <p className="text-sm text-gray-500 mt-1">
            Cadastre uma nova categoria ou gerencie as categorias existentes.
          </p>
        </div>

        {/* CONTEÚDO DO CARD */}
        <div className="p-4 sm:p-5">
          {/* FORMULÁRIO */}
          <form onSubmit={cadastrarCategoria}>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Nome da categoria
            </label>

            <div className="flex flex-col sm:flex-row gap-3">
              <input
                type="text"
                value={nome}
                onChange={(e) => setNome(e.target.value)}
                placeholder="Ex.: Produtos de limpeza"
                className="flex-1 min-w-0 border border-gray-300 rounded-lg px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-500"
              />

              <button
                type="submit"
                disabled={carregando}
                className="w-full sm:w-auto flex items-center justify-center gap-2 bg-blue-600 text-white px-5 py-2.5 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
              >
                <Plus size={18} />

                {carregando ? "Cadastrando..." : "Cadastrar"}
              </button>
            </div>
          </form>

          {/* SEPARAÇÃO */}
          <div className="border-t border-gray-200 my-6" />

          {/* TÍTULO DA LISTA */}
          <div className="mb-3">
            <h3 className="text-base font-semibold text-gray-800">
              Lista de categorias
            </h3>
          </div>

          {/* LISTA */}
          <div className="border border-gray-200 rounded-lg overflow-hidden">
            {categorias.length === 0 ? (
              <div className="text-center py-8 px-4 text-sm text-gray-500">
                Nenhuma categoria cadastrada.
              </div>
            ) : (
              <>
                {/* DESKTOP */}
                <div className="hidden sm:block">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="text-left px-5 py-3 text-sm font-semibold text-gray-600">
                          Categoria
                        </th>

                        <th className="text-right px-5 py-3 text-sm font-semibold text-gray-600">
                          Ações
                        </th>
                      </tr>
                    </thead>

                    <tbody>
                      {categorias.map((categoria) => {
                        const estaEditando = editandoId === categoria.id;

                        return (
                          <tr
                            key={categoria.id}
                            className="border-t hover:bg-gray-50"
                          >
                            {/* NOME */}
                            <td className="px-5 py-3">
                              <span
                                className={
                                  estaEditando
                                    ? "hidden"
                                    : "text-sm text-gray-700"
                                }
                              >
                                {categoria.nome}
                              </span>

                              <input
                                type="text"
                                value={
                                  estaEditando ? nomeEdicao : categoria.nome
                                }
                                onChange={(e) => {
                                  if (estaEditando) {
                                    setNomeEdicao(e.target.value);
                                  }
                                }}
                                readOnly={!estaEditando}
                                className={
                                  estaEditando
                                    ? "w-full border border-gray-300 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500"
                                    : "hidden"
                                }
                              />
                            </td>

                            {/* AÇÕES */}
                            <td className="px-5 py-3">
                              <div className="flex justify-end gap-2">
                                {/* EDITAR */}
                                <button
                                  type="button"
                                  onClick={() => iniciarEdicao(categoria)}
                                  className={
                                    estaEditando
                                      ? "hidden"
                                      : "flex items-center gap-1 px-3 py-1.5 rounded-lg bg-gray-100 text-gray-700 hover:bg-gray-200 text-sm"
                                  }
                                >
                                  <Pencil size={16} />
                                  Editar
                                </button>

                                {/* EXCLUIR */}
                                <button
                                  type="button"
                                  onClick={() => excluirCategoria(categoria.id)}
                                  className={
                                    estaEditando
                                      ? "hidden"
                                      : "flex items-center gap-1 px-3 py-1.5 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 text-sm"
                                  }
                                >
                                  <Trash2 size={16} />
                                  Excluir
                                </button>

                                {/* SALVAR */}
                                <button
                                  type="button"
                                  onClick={() => salvarEdicao(categoria.id)}
                                  className={
                                    estaEditando
                                      ? "px-3 py-1.5 rounded-lg bg-green-600 text-white hover:bg-green-700 text-sm"
                                      : "hidden"
                                  }
                                >
                                  Salvar
                                </button>

                                {/* CANCELAR */}
                                <button
                                  type="button"
                                  onClick={cancelarEdicao}
                                  className={
                                    estaEditando
                                      ? "px-3 py-1.5 rounded-lg bg-gray-100 text-gray-700 hover:bg-gray-200 text-sm"
                                      : "hidden"
                                  }
                                >
                                  Cancelar
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                {/* MOBILE */}
                <div className="sm:hidden divide-y divide-gray-200">
                  {categorias.map((categoria) => {
                    const estaEditando = editandoId === categoria.id;

                    return (
                      <div key={categoria.id} className="p-4">
                        <div className="mb-3">
                          <span className="block text-xs text-gray-500 mb-1">
                            Categoria
                          </span>

                          {!estaEditando && (
                            <span className="block text-sm font-medium text-gray-700 break-words">
                              {categoria.nome}
                            </span>
                          )}

                          {estaEditando && (
                            <input
                              type="text"
                              value={nomeEdicao}
                              onChange={(e) => setNomeEdicao(e.target.value)}
                              className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-500"
                              autoFocus
                            />
                          )}
                        </div>

                        {/* AÇÕES MOBILE */}
                        <div className="flex gap-2">
                          {!estaEditando && (
                            <>
                              <button
                                type="button"
                                onClick={() => iniciarEdicao(categoria)}
                                className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg bg-gray-100 text-gray-700 hover:bg-gray-200 text-sm"
                              >
                                <Pencil size={16} />
                                Editar
                              </button>

                              <button
                                type="button"
                                onClick={() => excluirCategoria(categoria.id)}
                                className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 text-sm"
                              >
                                <Trash2 size={16} />
                                Excluir
                              </button>
                            </>
                          )}

                          {estaEditando && (
                            <>
                              <button
                                type="button"
                                onClick={() => salvarEdicao(categoria.id)}
                                className="flex-1 px-3 py-2 rounded-lg bg-green-600 text-white hover:bg-green-700 text-sm"
                              >
                                Salvar
                              </button>

                              <button
                                type="button"
                                onClick={cancelarEdicao}
                                className="flex-1 px-3 py-2 rounded-lg bg-gray-100 text-gray-700 hover:bg-gray-200 text-sm"
                              >
                                Cancelar
                              </button>
                            </>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Categoria;
