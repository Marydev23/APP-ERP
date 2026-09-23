import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function Cadastro() {
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [confirmarSenha, setConfirmarSenha] = useState("");
  const navigate = useNavigate();

  async function handleCadastro(e) {
    e.preventDefault();

    if (!nome || !email || !senha || !confirmarSenha) {
      alert("Preencha todos os campos.");
      return;
    }

    if (senha !== confirmarSenha) {
      alert("As senhas não conferem.");
      return;
    }

    try {
      const resposta = await fetch("http://localhost:5000/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          nome,
          email,
          senha,
        }),
      });

      const dados = await resposta.json();

      if (!resposta.ok) {
        alert(dados.erro || "Erro ao cadastrar usuário.");
        return;
      }

      alert("Conta criada com sucesso!");
      navigate("/login");
    } catch (erro) {
      console.error(erro);
      alert("Não foi possível conectar ao servidor.");
    }
  }

  return (
    <main className="min-h-screen flex items-center justify-center bg-gray-100 p-6">
      <div className="w-full max-w-md bg-white border rounded-lg p-8 shadow-sm">
        <h1 className="text-2xl font-semibold mb-2">Criar sua conta</h1>

        <p className="text-gray-500 mb-6">
          Cadastre seus dados para começar a usar o Anota.
        </p>

        <form onSubmit={handleCadastro} className="space-y-5">
          <Input
            label="Nome"
            placeholder="Digite seu nome"
            value={nome}
            onChange={(e) => setNome(e.target.value)}
          />

          <Input
            label="E-mail"
            type="email"
            placeholder="seuemail@gmail.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          <Input
            label="Senha"
            type="password"
            placeholder="Digite sua senha"
            value={senha}
            onChange={(e) => setSenha(e.target.value)}
          />

          <Input
            label="Confirmar senha"
            type="password"
            placeholder="Digite a senha novamente"
            value={confirmarSenha}
            onChange={(e) => setConfirmarSenha(e.target.value)}
          />

          <button
            type="submit"
            className="w-full bg-gray-700 text-white py-2 rounded-lg hover:bg-blue-700 transition"
          >
            Criar conta
          </button>
        </form>

        <div className="text-center mt-6 text-sm text-gray-600">
          Já possui uma conta?
          <button
            type="button"
            onClick={() => navigate("/login")}
            className="ml-1 text-blue-600 hover:underline"
          >
            Entrar
          </button>
        </div>
      </div>
    </main>
  );
}

function Input({ label, placeholder, type = "text", value, onChange }) {
  return (
    <div className="space-y-1">
      <label className="block font-medium">{label}</label>

      <input
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        className="w-full border rounded-lg p-2"
      />
    </div>
  );
}
