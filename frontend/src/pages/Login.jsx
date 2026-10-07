import { FaUser, FaLock } from "react-icons/fa";
import "../style.css";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import logo from "../assets/logo-app.png";

const Login = () => {
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");

  const navigate = useNavigate();

  async function handleSubmit(event) {
    event.preventDefault();

    if (!email || !senha) {
      alert("Preencha o e-mail e a senha.");
      return;
    }

    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/auth/login`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email: email,
            senha: senha,
          }),
        },
      );

      const data = await response.json();

      if (!response.ok) {
        alert(data.erro || "E-mail ou senha inválidos.");
        return;
      }

      localStorage.setItem("access_token", data.access_token);

      alert("Login realizado com sucesso!");

      navigate("/dashboard");
    } catch (error) {
      console.error("Erro:", error);
      alert("Erro ao conectar ao servidor.");
    }
  }

  return (
    <div className="min-h-[100dvh] w-full bg-gradient-to-br from-[#020817] via-[#061d45] to-[#003b9f] flex items-center justify-center overflow-hidden">
      {/* CONTAINER PRINCIPAL */}
      <div className="relative h-[100dvh] w-full bg-gradient-to-br from-[#020817] via-[#061d45] to-[#003b9f] flex flex-col overflow-hidden sm:h-auto sm:min-h-[100dvh] sm:max-w-md sm:rounded-3xl sm:shadow-2xl">
        {/* DETALHES DO FUNDO */}

        <div className="absolute -top-24 -right-24 w-64 h-64 bg-blue-600/20 rounded-full blur-3xl" />

        <div className="absolute -bottom-24 -left-24 w-72 h-72 bg-blue-500/10 rounded-full blur-3xl" />

        {/* LINHA DIAGONAL SUPERIOR */}

        <div className="absolute top-[-100px] right-[70px] w-[2px] h-[500px] bg-gradient-to-b from-transparent via-[#1264e8] to-transparent rotate-[35deg] opacity-25" />

        {/* LINHA DIAGONAL INFERIOR */}

        <div className="absolute bottom-[-220px] left-[110px] w-[2px] h-[550px] bg-gradient-to-t from-transparent via-[#1264e8] to-transparent rotate-[55deg] opacity-35" />

        {/* BRILHO */}

        <div className="absolute top-[8%] left-[15%] w-32 h-32 bg-blue-500/10 rounded-full blur-3xl" />

        {/* CONTEÚDO */}

        <div className="relative z-10 flex-1 flex flex-col justify-center px-5 py-4">
          {/* LOGO */}

          <div className="flex justify-center mb-4">
            <img
              src={logo}
              alt="Logo Anota ERP"
              className="w-28 max-w-[45%] h-auto object-contain"
            />
          </div>

          {/* TÍTULO */}

          <div className="text-center mb-4">
            <h2 className="text-lg font-bold text-white">Seja bem-vindo!</h2>

            <p className="text-xs text-blue-100/70 mt-1">
              Acesse sua conta para continuar
            </p>
          </div>

          {/* FORMULÁRIO */}

          <form onSubmit={handleSubmit} className="w-full space-y-3">
            {/* E-MAIL */}

            <div>
              <label className="block text-xs font-medium text-white mb-1.5">
                E-mail
              </label>

              <div className="relative">
                <FaUser className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#1264e8] text-sm" />

                <input
                  type="email"
                  placeholder="Digite seu e-mail"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full h-10 pl-10 pr-3 bg-white/95 border border-white/20 rounded-lg text-xs text-slate-800 placeholder:text-slate-400 focus:border-[#1264e8] focus:ring-2 focus:ring-blue-500/20 focus:outline-none transition"
                />
              </div>
            </div>

            {/* SENHA */}

            <div>
              <label className="block text-xs font-medium text-white mb-1.5">
                Senha
              </label>

              <div className="relative">
                <FaLock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#1264e8] text-sm" />

                <input
                  type="password"
                  placeholder="Digite sua senha"
                  value={senha}
                  onChange={(e) => setSenha(e.target.value)}
                  className="w-full h-10 pl-10 pr-3 bg-white/95 border border-white/20 rounded-lg text-xs text-slate-800 placeholder:text-slate-400 focus:border-[#1264e8] focus:ring-2 focus:ring-blue-500/20 focus:outline-none transition"
                />
              </div>
            </div>

            {/* ESQUECEU A SENHA */}

            <div className="flex justify-end">
              <button
                type="button"
                onClick={() => navigate("/recuperar-senha")}
                className="text-xs text-[#60a5fa] font-medium hover:underline"
              >
                Esqueceu a senha?
              </button>
            </div>

            {/* ENTRAR */}

            <button
              type="submit"
              className="w-full h-10 bg-gradient-to-r from-[#0084ff] to-[#0754d9] hover:from-[#0074e8] hover:to-[#064bc2] text-white text-sm font-semibold rounded-lg shadow-lg shadow-blue-500/30 transition active:scale-[0.98]"
            >
              Entrar
            </button>

            {/* DIVISOR */}

            <div className="flex items-center gap-2 py-0.5">
              <div className="flex-1 border-t border-white/15" />

              <span className="text-[10px] text-blue-100/60">ou</span>

              <div className="flex-1 border-t border-white/15" />
            </div>

            {/* GOOGLE */}

            <button
              type="button"
              className="w-full h-10 bg-white/95 border border-white/20 rounded-lg flex items-center justify-center gap-2 hover:bg-white transition"
            >
              <img
                src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg"
                alt="Google"
                className="w-4 h-4"
              />

              <span className="text-xs font-medium text-slate-700">
                Continuar com Google
              </span>
            </button>
          </form>

          {/* CADASTRO */}

          <div className="text-center text-xs text-blue-100/70 mt-4">
            Não possui uma conta?{" "}
            <button
              type="button"
              onClick={() => navigate("/cadastro")}
              className="text-[#60a5fa] font-semibold hover:underline"
            >
              Cadastre-se
            </button>
          </div>
        </div>

        {/* LINHA INFERIOR */}

        <div className="relative z-10 flex justify-center pb-3">
          <div className="w-24 h-[2px] bg-gradient-to-r from-transparent via-[#1683ff] to-transparent" />
        </div>
      </div>
    </div>
  );
};

export default Login;
