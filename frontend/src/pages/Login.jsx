import { FaUser, FaLock } from "react-icons/fa";
import "../style.css";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import logo from "../imagens/logo-app.png";

const Login = () => {
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");

  const navigate = useNavigate();

  async function handleSubmit(event) {
    event.preventDefault();

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          Email: email,
          Senha: senha,
        }),
      });
      const data = await response.json();

      if (!response.ok) {
        alert(data.erro);
        return;
      }

      alert("Login realizado! Bem-vindo " + data.usuario.Nome);

      localStorage.setItem("usuario", JSON.stringify(data.usuario));

      navigate("/dashboard");
    } catch (error) {
      console.error("Erro:", error);
      alert("Erro ao conectar ao servidor.");
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-4">
      <div className="w-full max-w-[360px] bg-white rounded-3xl shadow-2xl p-6">
        {/* Logo */}
        <div className="text-center mb-4">
          <img src={logo} alt="Logo Anota ERP" className="w-48 mx-auto" />
        </div>

        {/* Título */}
        <div className="text-center mb-5">
          <h2 className="text-3xl font-bold text-slate-800">
            Acesse sua Conta
          </h2>

          <p className="text-sm text-slate-500 mt-1">
            Faça login para continuar
          </p>
        </div>

        {/* Formulário */}
        <form
          onSubmit={handleSubmit}
          className="w-full space-y-4 bg-slate-80 rounded-2xl p-5 shadow-sm"
        >
          {/* Email */}
          <div className="relative">
            <FaUser className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />

            <input
              type="email"
              placeholder="E-mail"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full h-11 pl-10 pr-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
          </div>

          {/* Senha */}
          <div className="relative">
            <FaLock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />

            <input
              type="password"
              placeholder="Senha"
              value={senha}
              onChange={(e) => setSenha(e.target.value)}
              className="w-full h-11 pl-10 pr-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
          </div>

          {/* Opções */}
          <div className="flex justify-between items-center text-xs">
            <label className="flex items-center gap-2 text-slate-600">
              <input type="checkbox" className="accent-blue-600" />
              Lembrar de mim
            </label>

            <a href="#" className="text-blue-600 hover:underline">
              Esqueceu a senha?
            </a>
          </div>

          {/* Botão Entrar */}
          <button
            type="submit"
            className="w-full h-11 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition"
          >
            Entrar
          </button>

          {/* Divisor */}
          <div className="flex items-center">
            <div className="flex-1 border-t border-slate-300"></div>

            <span className="px-3 text-xs text-slate-500">ou</span>

            <div className="flex-1 border-t border-slate-300"></div>
          </div>

          {/* Google */}
          <button
            type="button"
            className="w-full h-11 border border-slate-300 rounded-lg flex items-center justify-center gap-3 hover:bg-slate-100 transition"
          >
            <img
              src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg"
              alt="Google"
              className="w-5 h-5"
            />

            <span className="font-medium text-slate-700">
              Continuar com Google
            </span>
          </button>
        </form>

        {/* Cadastro */}
        <div className="text-center text-sm text-slate-600 mt-6">
          Não possui uma conta?{" "}
          <a
            href="/usuario"
            className="text-blue-600 font-semibold hover:underline"
          >
            Cadastre-se
          </a>
        </div>
      </div>
    </div>
  );
};

export default Login;
