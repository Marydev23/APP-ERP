import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Login from "./pages/Login";
import Layout from "./Layouts/Layout";
import Dashboard from "./pages/Dashboard";
import Despesas from "./pages/Despesas";
import Receitas from "./pages/Receitas";
import ListaVendas from "./pages/ListaVendas";
import Funcionarios from "./pages/Funcionarios";
import Orcamento from "./pages/Orcamento";
import Cadastro from "./pages/cadastro";
import RecuperarSenha from "./pages/RecuperarSenha";
import FormaPagamento from "./pages/FormaPagamento";
import Categoria from "./pages/categoria";
import Geral from "./pages/geral";
import Empresa from "./pages/configuracao/empresa";
import Usuario from "./pages/configuracao/usuario";
import Relatorio from "./pages/configuracao/relatorio";

function App() {
  return (
    <Router>
      <Routes>
        {/* Login */}
        <Route path="/" element={<Login />} />
        <Route path="/login" element={<Login />} />
        {/* Dashboard */}
        <Route
          path="/dashboard"
          element={
            <Layout>
              <Dashboard />
            </Layout>
          }
        />
        <Route path="/cadastro" element={<Cadastro />} />
        {/* Despesas */}
        <Route
          path="/despesas"
          element={
            <Layout>
              <Despesas />
            </Layout>
          }
        />
        {/* Receitas */}
        <Route
          path="/receitas"
          element={
            <Layout>
              <Receitas />
            </Layout>
          }
        />
        <Route
          path="/lista-vendas"
          element={
            <Layout>
              <ListaVendas />
            </Layout>
          }
        />
        {/* Funcionários */}
        <Route
          path="/funcionarios"
          element={
            <Layout>
              <Funcionarios />
            </Layout>
          }
        />
        {/* Orçamentos */}
        <Route
          path="/orcamento"
          element={
            <Layout>
              <Orcamento />
            </Layout>
          }
        />
        <Route
          path="/usuario"
          element={
            <Layout>
              <Usuario />
            </Layout>
          }
        />
        <Route
          path="/empresa"
          element={
            <Layout>
              <Empresa />
            </Layout>
          }
        />
        <Route
          path="/relatorio"
          element={
            <Layout>
              <Relatorio />
            </Layout>
          }
        />
        <Route path="/recuperar-senha" element={<RecuperarSenha />} />
        <Route
          path="/forma-pagamento"
          element={
            <Layout>
              <FormaPagamento />
            </Layout>
          }
        />{" "}
        <Route
          path="/categoria"
          element={
            <Layout>
              <Categoria />
            </Layout>
          }
        />
        <Route
          path="/geral"
          element={
            <Layout>
              <Geral />
            </Layout>
          }
        />
        <Route path="*" element={<Login />} />
      </Routes>
    </Router>
  );
}

export default App;
