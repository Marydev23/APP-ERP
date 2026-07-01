import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Login from "./pages/Login";
import Layout from "./Layouts/Layout";
import Dashboard from "./pages/Dashboard";
import Despesas from "./pages/Despesas";
import Receitas from "./pages/Receitas";
import Funcionarios from "./pages/Funcionarios";
import Configuracao from "./pages/configuracao/Configuracao";
import Orcamento from "./pages/Orcamento";

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

        {/* Configuração */}
        <Route path="/configuracao" element={<Configuracao />} />

        <Route path="*" element={<Login />} />
      </Routes>
    </Router>
  );
}

export default App;
