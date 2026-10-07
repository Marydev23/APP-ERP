import React, { useEffect, useState } from "react";
import { Save, Pencil } from "lucide-react";

function FormaPagamento() {
  const [formas, setFormas] = useState([]);
  const [taxas, setTaxas] = useState({});
  const [carregando, setCarregando] = useState(false);
  const [salvando, setSalvando] = useState(false);
  const [editando, setEditando] = useState(false);
  const [erro, setErro] = useState("");
  const [mensagem, setMensagem] = useState("");

  const API_URL = "http://127.0.0.1:5000";
  const token = localStorage.getItem("access_token");

  // ==========================================================
  // FORMAS PADRÃO
  // ==========================================================

  const formasPadrao = [
    {
      id: "credito",
      nome: "Cartão de Crédito",
    },
    {
      id: "debito",
      nome: "Cartão de Débito",
    },
    {
      id: "pix",
      nome: "PIX",
    },
    {
      id: "dinheiro",
      nome: "Dinheiro",
    },
    {
      id: "boleto",
      nome: "Boleto",
    },
  ];

  // ==========================================================
  // CARREGAR FORMAS E TAXAS
  // ==========================================================

  useEffect(() => {
    carregarDados();
  }, []);

  const carregarDados = async () => {
    try {
      setCarregando(true);
      setErro("");

      // ------------------------------------------------------
      // CARREGAR FORMAS DO BANCO
      // ------------------------------------------------------

      const respostaFormas = await fetch(`${API_URL}/forma-pagamento/`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const dadosFormas = await respostaFormas.json();

      if (!respostaFormas.ok) {
        throw new Error(
          dadosFormas.erro || "Erro ao carregar formas de pagamento.",
        );
      }

      // ------------------------------------------------------
      // CARREGAR TAXAS
      // ------------------------------------------------------

      const respostaTaxas = await fetch(`${API_URL}/taxa-pagamento/`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const dadosTaxas = await respostaTaxas.json();

      if (!respostaTaxas.ok) {
        throw new Error(dadosTaxas.erro || "Erro ao carregar taxas.");
      }

      // ------------------------------------------------------
      // GUARDAR AS FORMAS DO BANCO
      // ------------------------------------------------------

      setFormas(Array.isArray(dadosFormas) ? dadosFormas : []);

      // ------------------------------------------------------
      // ORGANIZAR TAXAS
      // ------------------------------------------------------

      const taxasOrganizadas = {};

      if (Array.isArray(dadosTaxas)) {
        dadosTaxas.forEach((taxa) => {
          if (Number(taxa.parcelas) === 1) {
            taxasOrganizadas[taxa.forma_pagamento_id] = taxa.percentual;
          }
        });
      }

      setTaxas(taxasOrganizadas);
    } catch (error) {
      console.error("Erro ao carregar formas de pagamento:", error);

      setErro(error.message);
    } finally {
      setCarregando(false);
    }
  };

  // ==========================================================
  // ALTERAR TAXA
  // ==========================================================

  const alterarTaxa = (formaId, valor) => {
    setTaxas((estadoAtual) => ({
      ...estadoAtual,
      [formaId]: valor,
    }));
  };

  // ==========================================================
  // SALVAR TODAS AS TAXAS
  // ==========================================================

  const salvarTodasAsTaxas = async () => {
    try {
      setErro("");
      setMensagem("");
      setSalvando(true);

      // ------------------------------------------------------
      // BUSCAR TAXAS EXISTENTES
      // ------------------------------------------------------

      const respostaTaxas = await fetch(`${API_URL}/taxa-pagamento/`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const listaTaxas = await respostaTaxas.json();

      if (!respostaTaxas.ok) {
        throw new Error(listaTaxas.erro || "Erro ao consultar taxas.");
      }

      // ------------------------------------------------------
      // SALVAR CADA FORMA
      // ------------------------------------------------------

      for (const forma of formas) {
        let percentual = taxas[forma.id];

        if (
          percentual === undefined ||
          percentual === null ||
          percentual === ""
        ) {
          percentual = 0;
        }

        percentual = String(percentual).replace(",", ".");

        percentual = Number(percentual);

        if (Number.isNaN(percentual)) {
          throw new Error(`Informe uma taxa válida para ${forma.nome}.`);
        }

        if (percentual < 0) {
          throw new Error(`A taxa de ${forma.nome} não pode ser negativa.`);
        }

        // ----------------------------------------------------
        // VERIFICAR SE JÁ EXISTE
        // ----------------------------------------------------

        const taxaExistente = Array.isArray(listaTaxas)
          ? listaTaxas.find(
              (taxa) =>
                Number(taxa.forma_pagamento_id) === Number(forma.id) &&
                Number(taxa.parcelas) === 1,
            )
          : null;

        // ----------------------------------------------------
        // ATUALIZAR
        // ----------------------------------------------------

        if (taxaExistente) {
          const response = await fetch(
            `${API_URL}/taxa-pagamento/${taxaExistente.id}`,
            {
              method: "PUT",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
              },
              body: JSON.stringify({
                parcelas: 1,
                percentual: percentual,
                ativo: true,
              }),
            },
          );

          const dados = await response.json();

          if (!response.ok) {
            throw new Error(
              dados.erro || `Erro ao atualizar a taxa de ${forma.nome}.`,
            );
          }
        }

        // ----------------------------------------------------
        // CADASTRAR
        // ----------------------------------------------------
        else {
          const response = await fetch(`${API_URL}/taxa-pagamento/`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({
              forma_pagamento_id: forma.id,
              parcelas: 1,
              percentual: percentual,
            }),
          });

          const dados = await response.json();

          if (!response.ok) {
            throw new Error(
              dados.erro || `Erro ao cadastrar a taxa de ${forma.nome}.`,
            );
          }
        }
      }

      setMensagem("Taxas de pagamento salvas com sucesso.");

      setEditando(false);

      // Recarregar valores
      await carregarDados();
    } catch (error) {
      console.error("Erro ao salvar taxas:", error);

      setErro(error.message);
    } finally {
      setSalvando(false);
    }
  };

  // ==========================================================
  // RENDER
  // ==========================================================

  return (
    <div className="p-6">
      {/* TÍTULO */}

      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">
          Formas de Pagamento
        </h1>

        <p className="text-gray-500 mt-1">
          Configure as taxas das formas de pagamento.
        </p>
      </div>

      {/* ERRO */}

      {erro && (
        <div className="mb-4 p-3 rounded-lg bg-red-50 text-red-600">{erro}</div>
      )}

      {/* SUCESSO */}

      {mensagem && (
        <div className="mb-4 p-3 rounded-lg bg-green-50 text-green-600">
          {mensagem}
        </div>
      )}

      {/* CARD */}

      <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
        <div className="p-5 border-b">
          <h2 className="text-lg font-semibold text-gray-800">
            Taxas de pagamento
          </h2>

          <p className="text-sm text-gray-500 mt-1">
            Clique em Editar para alterar as taxas.
          </p>
        </div>

        <div className="p-5">
          {carregando ? (
            <div className="text-center py-8 text-gray-500">Carregando...</div>
          ) : (
            <div className="space-y-3">
              {formasPadrao.map((formaPadrao) => {
                const formaBanco = formas.find((forma) => {
                  const nomeBanco = forma.nome?.toLowerCase().trim();

                  return nomeBanco === formaPadrao.nome.toLowerCase().trim();
                });

                const valorTaxa = formaBanco ? (taxas[formaBanco.id] ?? 0) : 0;

                return (
                  <div
                    key={formaPadrao.id}
                    className="flex items-center justify-between gap-6 border rounded-lg px-4 py-3"
                  >
                    {/* NOME */}

                    <div className="flex-1">
                      <span className="font-medium text-gray-700">
                        {formaPadrao.nome}
                      </span>
                    </div>

                    {/* INPUT */}

                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        inputMode="decimal"
                        value={valorTaxa}
                        disabled={!editando || !formaBanco}
                        onChange={(e) => {
                          if (!formaBanco) {
                            return;
                          }

                          alterarTaxa(formaBanco.id, e.target.value);
                        }}
                        placeholder="0,00"
                        className={`w-32 border rounded-lg px-3 py-2 text-right outline-none ${
                          editando && formaBanco
                            ? "border-gray-300 bg-white focus:ring-2 focus:ring-blue-500"
                            : "border-gray-200 bg-gray-100 text-gray-500 cursor-not-allowed"
                        }`}
                      />

                      <span className="text-gray-500">%</span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* BOTÕES */}

          {!carregando && (
            <div className="flex justify-end gap-3 mt-6 pt-5 border-t">
              {/* EDITAR */}

              <button
                type="button"
                onClick={() => {
                  setEditando(true);
                  setMensagem("");
                  setErro("");
                }}
                disabled={editando || salvando}
                className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-gray-100 text-gray-700 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Pencil size={18} />
                Editar
              </button>

              {/* SALVAR */}

              <button
                type="button"
                onClick={salvarTodasAsTaxas}
                disabled={!editando || salvando}
                className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-green-600 text-white hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Save size={18} />

                {salvando ? "Salvando..." : "Salvar"}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default FormaPagamento;
