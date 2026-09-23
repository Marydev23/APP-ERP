import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

export default function Usuario() {
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");

  const [carregando, setCarregando] = useState(true);
  const [editando, setEditando] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    carregarUsuario();
  }, []);

  const carregarUsuario = async () => {
    try {
      const token = localStorage.getItem("access_token");

      if (!token) {
        console.log("Token não encontrado.");
        setCarregando(false);
        return;
      }

      const res = await fetch(`${import.meta.env.VITE_API_URL}/empresa/`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();

      if (!res.ok) {
        console.error("Erro ao carregar usuário:", data);

        setCarregando(false);
        return;
      }

      setNome(data.nome || "");
      setEmail(data.email || "");
    } catch (err) {
      console.error("Erro de conexão ao carregar usuário:", err);
    } finally {
      setCarregando(false);
    }
  };

  const salvarUsuario = async () => {
    try {
      console.log("1 - Clicou em salvar");

      const token = localStorage.getItem("access_token");

      console.log("2 - Token:", token);

      if (!token) {
        alert("Sessão não encontrada. Faça login novamente.");
        return;
      }

      const dados = {
        nome,
        email,
        senha,
      };

      console.log("3 - Enviando:", dados);

      const res = await fetch("http://localhost:5000/usuario/me", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(dados),
      });

      console.log("4 - Status:", res.status);

      const data = await res.json();

      console.log("5 - Resposta:", data);

      if (!res.ok) {
        alert(data.erro || "Erro ao atualizar usuário.");
        return;
      }

      alert("Usuário atualizado com sucesso!");

      setSenha("");
      setEditando(false);
      navigate("/Login");

      carregarUsuario();
    } catch (err) {
      console.error("6 - Erro:", err);

      alert("Erro de conexão com o servidor.");
    }
  };
  return (
    <main className="flex-1 bg-white border rounded-lg p-8">
      <h1 className="text-2xl font-semibold mb-6">Minha Conta</h1>

      {carregando ? (
        <p className="text-gray-500">Carregando seus dados...</p>
      ) : (
        <div className="space-y-5">
          <Input
            label="Nome"
            value={nome}
            onChange={setNome}
            placeholder="Nome"
            disabled={!editando}
          />

          <Input
            label="E-mail"
            value={email}
            onChange={setEmail}
            placeholder="seuemail@gmail.com"
            disabled={!editando}
          />

          <Input
            label="Senha"
            value={editando ? senha : "••••••••"}
            onChange={setSenha}
            placeholder={editando ? "Digite uma nova senha" : ""}
            disabled={!editando}
            type="password"
          />

          <div className="flex justify-end gap-2 mt-8">
            <button
              type="button"
              onClick={salvarUsuario}
              disabled={!editando}
              className="bg-gray-600 text-white w-20 h-7 px-2 py-1 text-xs hover:bg-blue-700 transition disabled:bg-gray-400"
            >
              Salvar
            </button>

            <button
              type="button"
              onClick={() => {
                setSenha("");
                setEditando(true);
              }}
              className="bg-gray-600 text-white w-20 h-7 px-2 py-1 text-xs hover:bg-gray-700 transition"
            >
              Editar
            </button>

            <button
              type="button"
              className="bg-gray-600 text-white w-20 h-7 px-2 py-1 text-xs hover:bg-red-700 transition"
            >
              Excluir
            </button>
          </div>
        </div>
      )}
    </main>
  );
}

function Input({
  label,
  value,
  onChange,
  placeholder,
  disabled,
  type = "text",
}) {
  return (
    <div className="space-y-1">
      <label className="block font-medium">{label}</label>

      <input
        type={type}
        value={value || ""}
        placeholder={placeholder}
        disabled={disabled}
        onChange={(e) => onChange(e.target.value)}
        className="w-full border rounded-lg p-2 outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
      />
    </div>
  );
}
