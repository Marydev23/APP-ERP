import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaEnvelope } from "react-icons/fa";
import logo from "../assets/logo-app.png";
import "../style.css";

const RecuperarSenha = () => {
  const [email, setEmail] = useState("");
  const navigate = useNavigate();

  function handleSubmit(event) {
    event.preventDefault();

    if (!email) {
      alert("Digite seu e-mail.");
      return;
    }

    alert("Em breve enviaremos as instruções para recuperação da senha.");
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-3">
      <div className="w-full max-w-[320px] bg-white rounded-3xl shadow-2xl p-5">
        <div className="text-center mb-4">
          <img src={logo} alt="Logo Anota ERP" className="w-28 mx-auto" />
        </div>

        <div className="text-center mb-5">
          <h2
            className="w-full text-xl font-bold text-slate-800"
            style={{
              display: "block",
              position: "relative",
              zIndex: 10,
            }}
          >
            Recuperar senha
          </h2>

          <p className="text-xs text-slate-500 mt-2">
            Digite seu e-mail para recuperar o acesso à sua conta.
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="w-full space-y-4 bg-slate-50 rounded-2xl p-4 shadow-sm"
        >
          {/* E-MAIL */}
          <div className="relative">
            <FaEnvelope className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />

            <input
              type="email"
              placeholder="E-mail"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full h-10 pl-10 pr-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
          </div>

          <button
            type="submit"
            onClick={() => navigate("/login")}
            className="w-full h-10 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition"
          >
            Enviar
          </button>
        </form>

        <div className="text-center text-xs text-slate-600 mt-5">
          Lembrou sua senha?{" "}
          <button
            type="button"
            onClick={() => navigate("/login")}
            className="text-blue-600 font-semibold hover:underline"
          >
            Voltar para o login
          </button>
        </div>
      </div>
    </div>
  );
};

export default RecuperarSenha;
