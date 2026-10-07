import React, { useState, useEffect } from "react";

export default function Empresa() {
  const [nome, setNome] = useState("");
  const [cnpj, setCnpj] = useState("");
  const [endereco, setEndereco] = useState("");
  const [cidade, setCidade] = useState("");
  const [estado, setEstado] = useState("");
  const [cep, setCep] = useState("");
  const [telefone, setTelefone] = useState("");
  const [email, setEmail] = useState("");
  const [site, setSite] = useState("");
  const [instagran, setInstagran] = useState("");
  const [slogan, setSlogan] = useState("");
  const [logo, setLogo] = useState(null);
  const [editando, setEditando] = useState(false);

  useEffect(() => {
    carregarEmpresa();
  }, []);

  const carregarEmpresa = async () => {
    try {
      const token = localStorage.getItem("access_token");

      if (!token) {
        console.log("Sessão não encontrada.");
        return;
      }

      const res = await fetch(`${import.meta.env.VITE_API_URL}/empresa/`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) {
        console.log("Nenhuma empresa cadastrada ainda.");
        return;
      }

      const data = await res.json();

      setNome(data.nome || "");
      setCnpj(data.cnpj || "");
      setEndereco(data.endereco || "");
      setCidade(data.cidade || "");
      setEstado(data.estado || "");
      setCep(data.cep || "");
      setTelefone(data.telefone || "");
      setEmail(data.email || "");
      setSite(data.site || "");
      setInstagran(data.instagram || "");
      setSlogan(data.slogan || "");
    } catch (err) {
      console.error("Erro ao carregar empresa:", err);
    }
  };

  const salvarEmpresa = async () => {
    try {
      const token = localStorage.getItem("access_token");

      if (!token) {
        alert("Sessão não encontrada. Faça login novamente.");
        return;
      }

      const dados = {
        nome,
        cnpj,
        endereco,
        cidade,
        estado,
        cep,
        telefone,
        email,
        site,
        instagram: instagran,
        slogan,
        logo: logo || null,
      };

      const res = await fetch("http://localhost:5000/empresa/", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(dados),
      });

      const data = await res.json();

      if (res.ok) {
        alert("Empresa atualizada com sucesso!");

        setEditando(false);

        carregarEmpresa();
      } else {
        console.error("Erro retornado pelo backend:", data);

        alert(data.erro || "Erro ao atualizar empresa.");
      }
    } catch (err) {
      console.error("Erro ao salvar empresa:", err);

      alert("Erro de conexão com o servidor.");
    }
  };

  return (
    <main className="flex-1 bg-white border rounded-lg p-8">
      <h1 className="text-3xl font-bold text-center mb-10">
        Configurações do Sistema
      </h1>

      <h2 className="text-2xl font-semibold mb-6">Dados da Empresa</h2>

      <div className="space-y-5">
        <Input
          label="Nome da Empresa"
          value={nome}
          onChange={setNome}
          disabled={!editando}
        />

        <Input
          label="CNPJ"
          value={cnpj}
          onChange={setCnpj}
          disabled={!editando}
        />

        <Input
          label="Endereço"
          value={endereco}
          onChange={setEndereco}
          disabled={!editando}
        />

        <Input
          label="Cidade"
          value={cidade}
          onChange={setCidade}
          disabled={!editando}
        />

        <Input
          label="Estado"
          value={estado}
          onChange={setEstado}
          disabled={!editando}
        />

        <Input label="CEP" value={cep} onChange={setCep} disabled={!editando} />

        <Input
          label="Telefone"
          value={telefone}
          onChange={setTelefone}
          disabled={!editando}
        />

        <Input
          label="E-mail"
          value={email}
          onChange={setEmail}
          disabled={!editando}
        />

        <Input
          label="Site"
          value={site}
          onChange={setSite}
          disabled={!editando}
        />

        <Input
          label="Instagram"
          value={instagran}
          onChange={setInstagran}
          disabled={!editando}
        />

        <Input
          label="Slogan"
          value={slogan}
          onChange={setSlogan}
          disabled={!editando}
        />

        <div className="space-y-2">
          <label className="font-medium">Logo</label>

          <input
            type="file"
            className="block"
            disabled={!editando}
            onChange={(e) => setLogo(e.target.files[0])}
          />

          {logo && typeof logo !== "string" && (
            <img
              src={URL.createObjectURL(logo)}
              alt="Logo"
              className="mt-2 w-32 h-32 object-contain border"
            />
          )}
        </div>

        <div className="flex gap-2">
          <button
            type="button"
            onClick={salvarEmpresa}
            disabled={!editando}
            className="bg-blue-600 text-white w-24 h-8 px-2 py-1 text-xs hover:bg-blue-700 transition disabled:bg-gray-400"
          >
            Salvar
          </button>

          <button
            type="button"
            onClick={() => setEditando(true)}
            className="bg-gray-600 text-white w-24 h-8 px-2 py-1 text-xs hover:bg-gray-700 transition"
          >
            Editar
          </button>
        </div>
      </div>
    </main>
  );
}

function Input({ label, value, onChange, placeholder, disabled }) {
  return (
    <div className="space-y-2">
      <label className="font-medium">{label}</label>

      <input
        type="text"
        value={value}
        disabled={disabled}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder || label}
        className="w-full border rounded-lg p-2 outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
      />
    </div>
  );
}
