import React, { useEffect, useState } from "react";
import api from "../services/api";

export default function Geral() {
  const [empresaDados, setEmpresaDados] = useState(null);
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    carregarEmpresa();
  }, []);

  const carregarEmpresa = async () => {
    try {
      const token = localStorage.getItem("access_token");

      if (!token) {
        console.log("Token não encontrado.");
        setCarregando(false);
        return;
      }

      const res = await api.get("/empresa/", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      console.log("Dados da empresa:", res.data);

      setEmpresaDados(res.data);
    } catch (err) {
      console.error("Erro ao carregar empresa:", err.response?.data || err);
      setEmpresaDados(null);
    } finally {
      setCarregando(false);
    }
  };

  const formatarCampo = (key) => {
    const campos = {
      id: "ID",
      nome: "Nome da Empresa",
      cnpj: "CNPJ",
      endereco: "Endereço",
      cidade: "Cidade",
      estado: "Estado",
      cep: "CEP",
      telefone: "Telefone",
      email: "E-mail",
      site: "Site",
      instagram: "Instagram",
      slogan: "Slogan",
    };

    return campos[key] || key;
  };

  return (
    <main className="flex-1 bg-white border rounded-lg p-8">
      <h1 className="text-2xl font-bold mb-6">Tela Geral</h1>

      {carregando ? (
        <p className="text-gray-500">Carregando dados da empresa...</p>
      ) : empresaDados ? (
        <div className="space-y-4">
          <div className="border rounded-lg p-5 bg-gray-50">
            <h2 className="text-xl font-semibold mb-4">Empresa</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {Object.entries(empresaDados)
                .filter(
                  ([key]) => key !== "logo" && key !== "slogan" && key !== "id",
                )
                .map(([key, value]) => (
                  <div key={key} className="border-b pb-2">
                    <span className="block text-sm font-semibold text-gray-600">
                      {formatarCampo(key)}
                    </span>

                    <span className="text-gray-900">{value || "-"}</span>
                  </div>
                ))}
            </div>
          </div>
        </div>
      ) : (
        <div className="border rounded-lg p-6 bg-gray-50">
          <p className="text-gray-500">Nenhum dado da empresa encontrado.</p>
        </div>
      )}
    </main>
  );
}
