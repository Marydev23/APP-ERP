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
      const res = await fetch("http://localhost:5000/empresa");
      if (!res.ok) throw new Error("Erro ao buscar dados da empresa");

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
      setInstagran(data.instagran || "");
      setSlogan(data.slogan || "");
    } catch (err) {
      console.error(err);
    }
  };

  const salvarEmpresa = async () => {
    try {
      const formData = new FormData();
      formData.append("nome", nome);
      formData.append("cnpj", cnpj);
      formData.append("endereco", endereco);
      formData.append("cidade", cidade);
      formData.append("estado", estado);
      formData.append("cep", cep);
      formData.append("telefone", telefone);
      formData.append("email", email);
      formData.append("site", site);
      formData.append("instagran", instagran);
      formData.append("slogan", slogan);
      if (logo) formData.append("logo", logo);

      const res = await fetch("http://localhost:5000/empresa", {
        method: "POST",
        body: formData,
      });

      if (res.ok) alert("Empresa salva com sucesso!");
      else alert("Erro ao salvar empresa");
    } catch (err) {
      console.error(err);
    }
  };

  function limparFormulario() {
    setNome("");
    setCnpj("");
    setEndereco("");
    setCidade("");
    setEstado("");
    setCep("");
    setTelefone("");
    setEmail("");
    setSite("");
    setInstagran("");
    setSlogan("");
    setLogo(null);
  }

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
          label="Instagran"
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
            onChange={(e) => setLogo(e.target.files[0])}
          />
          {logo && typeof logo === "string" ? (
            <img
              src={`http://localhost:5000/imagens/${logo.split("/").pop()}`}
              alt="Logo"
              className="mt-2 w-32 h-32 object-contain border"
            />
          ) : (
            logo && (
              <img
                src={URL.createObjectURL(logo)}
                alt="Logo"
                className="mt-2 w-32 h-32 object-contain border"
              />
            )
          )}
        </div>

        <div className="flex gap-2">
          <button
            type="button"
            onClick={async () => {
              await salvarEmpresa();
              setEditando(false);
            }}
            className="bg-blue-600 text-white w-24 h-8 px-2 py-1 text-xs hover:bg-blue-700 transition"
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
