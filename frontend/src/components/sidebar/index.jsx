import { useState } from "react";

import {
  Home,
  TrendingUp,
  TrendingDown,
  FileText,
  User,
  Users,
  Settings,
  CreditCard,
  Tags,
  LogOut,
  Bell,
  Menu,
  ChevronRight,
  ChevronDown,
  FileBarChart,
  Building2,
} from "lucide-react";

import {
  Sheet,
  SheetTrigger,
  SheetContent,
  SheetClose,
} from "@/components/ui/sheet";

import { Link } from "react-router-dom";

import logo from "../../assets/logo-app-2.png";

export function Sidebar() {
  const [configAberta, setConfigAberta] = useState(false);

  const sair = () => {
    localStorage.clear();
    window.location.href = "/login";
  };

  return (
    <>
      {/* =====================================================
          DESKTOP
      ====================================================== */}

      <aside className="fixed inset-y-0 left-0 z-40 hidden w-72 flex-col bg-[#06245c] text-white md:flex">
        {/* TOPO */}
        <div className="px-6 pb-5 pt-7">
          {/* LOGO */}
          <div className="mb-7 flex items-center justify-center">
            <img
              src={logo}
              alt="ANOTA"
              className="w-28 h-auto object-contain"
            />
          </div>

          {/* USUÁRIO */}
          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-blue-600">
              <User className="h-8 w-8 text-white" />
            </div>

            <div>
              <p className="text-lg font-semibold text-white">Marilza</p>

              <p className="text-sm text-white/70">Empresa: Marilza</p>
            </div>
          </div>
        </div>

        {/* LINHA */}
        <div className="mx-6 border-t border-white/10" />

        {/* MENU */}
        <nav className="flex flex-1 flex-col gap-1 overflow-y-auto px-4 py-5">
          <Link
            to="/dashboard"
            className="flex items-center gap-4 rounded-xl bg-blue-700/70 px-4 py-3.5 text-sm font-semibold text-white transition hover:bg-blue-700"
          >
            <Home className="h-6 w-6" />

            <span>Início</span>

            <ChevronRight className="ml-auto h-5 w-5" />
          </Link>
          <Link
            to="/geral"
            className="flex items-center gap-4 rounded-xl px-4 py-3.5 text-sm font-medium text-white/90 transition hover:bg-white/10"
          >
            <Home className="h-6 w-6" />

            <span>Minha Conta</span>

            <ChevronRight className="ml-auto h-5 w-5" />
          </Link>

          {/* FUNCIONÁRIOS */}
          <Link
            to="/funcionarios"
            className="flex items-center gap-4 rounded-xl px-4 py-3.5 text-sm font-medium text-white/90 transition hover:bg-white/10"
          >
            <Users className="h-6 w-6" />

            <span>Funcionários</span>

            <ChevronRight className="ml-auto h-5 w-5" />
          </Link>

          {/* FORMA DE PAGAMENTO */}
          <Link
            to="/forma-pagamento"
            className="flex items-center gap-4 rounded-xl px-4 py-3.5 text-sm font-medium text-white/90 transition hover:bg-white/10"
          >
            <CreditCard className="h-6 w-6" />

            <span>Forma de Pagamento</span>

            <ChevronRight className="ml-auto h-5 w-5" />
          </Link>

          {/* CATEGORIAS */}
          <Link
            to="/categoria"
            className="flex items-center gap-4 rounded-xl px-4 py-3.5 text-sm font-medium text-white/90 transition hover:bg-white/10"
          >
            <Tags className="h-6 w-6" />

            <span>Categorias</span>

            <ChevronRight className="ml-auto h-5 w-5" />
          </Link>

          {/* CONFIGURAÇÕES */}
          <div className="mt-1">
            <button
              type="button"
              onClick={() => setConfigAberta((prev) => !prev)}
              className="flex w-full items-center gap-4 rounded-xl px-4 py-3.5 text-sm font-medium text-white/90 transition hover:bg-white/10"
            >
              <Settings className="h-6 w-6" />

              <span>Configurações</span>

              <ChevronDown
                className={`ml-auto h-5 w-5 transition-transform ${
                  configAberta ? "rotate-180" : ""
                }`}
              />
            </button>

            {configAberta && (
              <div className="ml-8 mt-1 flex flex-col border-l border-white/20 pl-3">
                {/* RELATÓRIO */}
                <Link
                  to="/relatorio"
                  className="flex items-center gap-3 px-3 py-3 text-sm text-white/75 transition hover:text-white"
                >
                  <FileBarChart className="h-4 w-4" />
                  <span>Relatório</span>
                </Link>

                {/* EMPRESA */}
                <Link
                  to="/empresa"
                  className="flex items-center gap-3 px-3 py-3 text-sm text-white/75 transition hover:text-white"
                >
                  <Building2 className="h-4 w-4" />
                  <span>Empresa</span>
                </Link>

                {/* USUÁRIO */}
                <Link
                  to="/usuario"
                  className="flex items-center gap-3 px-3 py-3 text-sm text-white/75 transition hover:text-white"
                >
                  <User className="h-4 w-4" />
                  <span>Usuário</span>
                </Link>
              </div>
            )}
          </div>
        </nav>

        {/* SAIR */}
        <div className="border-t border-white/10 px-4 ">
          <button
            type="button"
            onClick={sair}
            className="flex w-full items-center gap-4 rounded-xl px-4 py-3.5 text-sm font-semibold text-red-400 transition hover:bg-white/10"
          >
            <LogOut className="h-6 w-6" />

            <span>Sair</span>
          </button>
        </div>
      </aside>

      {/* =====================================================
          MOBILE
      ====================================================== */}

      <div className="md:hidden">
        {/* CABEÇALHO */}
        <header className="fixed left-0 right-0 top-0 z-50 h-16 bg-[#06245c] text-white shadow-md">
          <div className="flex h-full items-center px-4">
            {/* HAMBURGUER */}
            <Sheet>
              <SheetTrigger asChild>
                <button
                  type="button"
                  aria-label="Abrir menu"
                  className="flex h-10 w-10 items-center justify-center rounded-lg transition hover:bg-white/10"
                >
                  <Menu className="h-6 w-6" />
                </button>
              </SheetTrigger>

              {/* MENU MOBILE */}
              <SheetContent
                side="left"
                className="w-[290px] border-none bg-[#06245c] p-0 text-white"
              >
                <div className="flex h-full flex-col">
                  {/* TOPO */}
                  <div className="px-6 pb-5 pt-7">
                    {/* LOGO */}
                    <div className="mb-7 flex items-center justify-center">
                      <img
                        src={logo}
                        alt="ANOTA"
                        className="w-28 h-auto object-contain"
                      />
                    </div>

                    {/* USUÁRIO */}
                    <div className="flex items-center gap-4">
                      <div className="flex h-14 w-14 items-center justify-center rounded-full bg-blue-600">
                        <User className="h-8 w-8 text-white" />
                      </div>

                      <div>
                        <p className="text-lg font-semibold text-white">
                          Marilza
                        </p>

                        <p className="text-sm text-white/70">
                          Empresa: Marilza
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* LINHA */}
                  <div className="mx-6 border-t border-white/10" />

                  {/* MENU */}
                  <nav className="flex flex-1 flex-col gap-1 overflow-y-auto px-4 py-5">
                    <SheetClose asChild>
                      <Link
                        to="/dashboard"
                        className="flex items-center gap-4 rounded-xl bg-blue-700/70 px-4 py-3.5 text-sm font-semibold text-white transition hover:bg-blue-700"
                      >
                        <Home className="h-6 w-6" />

                        <span>Início</span>

                        <ChevronRight className="ml-auto h-5 w-5" />
                      </Link>
                    </SheetClose>

                    <SheetClose asChild>
                      <Link
                        to="/geral"
                        className="flex items-center gap-4 rounded-xl px-4 py-3.5 text-sm font-medium text-white/90 transition hover:bg-white/10"
                      >
                        <Home className="h-6 w-6" />

                        <span>Minha Conta</span>

                        <ChevronRight className="ml-auto h-5 w-5" />
                      </Link>
                    </SheetClose>

                    {/* FUNCIONÁRIOS */}
                    <SheetClose asChild>
                      <Link
                        to="/funcionarios"
                        className="flex items-center gap-4 rounded-xl px-4 py-3.5 text-sm font-medium text-white/90 transition hover:bg-white/10"
                      >
                        <Users className="h-6 w-6" />

                        <span>Funcionários</span>

                        <ChevronRight className="ml-auto h-5 w-5" />
                      </Link>
                    </SheetClose>

                    {/* FORMA DE PAGAMENTO */}
                    <SheetClose asChild>
                      <Link
                        to="/forma-pagamento"
                        className="flex items-center gap-4 rounded-xl px-4 py-3.5 text-sm font-medium text-white/90 transition hover:bg-white/10"
                      >
                        <CreditCard className="h-6 w-6" />

                        <span>Forma de Pagamento</span>

                        <ChevronRight className="ml-auto h-5 w-5" />
                      </Link>
                    </SheetClose>

                    {/* CATEGORIAS */}
                    <SheetClose asChild>
                      <Link
                        to="/categoria"
                        className="flex items-center gap-4 rounded-xl px-4 py-3.5 text-sm font-medium text-white/90 transition hover:bg-white/10"
                      >
                        <Tags className="h-6 w-6" />

                        <span>Categorias</span>

                        <ChevronRight className="ml-auto h-5 w-5" />
                      </Link>
                    </SheetClose>

                    {/* CONFIGURAÇÕES */}
                    <div className="mt-1">
                      <button
                        type="button"
                        onClick={() => setConfigAberta((prev) => !prev)}
                        className="flex w-full items-center gap-4 rounded-xl px-4 py-3.5 text-sm font-medium text-white/90 transition hover:bg-white/10"
                      >
                        <Settings className="h-6 w-6" />

                        <span>Configurações</span>

                        <ChevronDown
                          className={`ml-auto h-5 w-5 transition-transform ${
                            configAberta ? "rotate-180" : ""
                          }`}
                        />
                      </button>

                      {configAberta && (
                        <div className="ml-8 mt-1 flex flex-col border-l border-white/20 pl-3">
                          <SheetClose asChild>
                            <Link
                              to="/empresa"
                              className="flex items-center gap-3 px-3 py-3 text-sm text-white/75 transition hover:text-white"
                            >
                              <Building2 className="h-4 w-4" />
                              <span>Empresa</span>
                            </Link>
                          </SheetClose>

                          <SheetClose asChild>
                            <Link
                              to="/relatorio"
                              className="flex items-center gap-3 px-3 py-3 text-sm text-white/75 transition hover:text-white"
                            >
                              <FileBarChart className="h-4 w-4" />
                              <span>Relatório</span>
                            </Link>
                          </SheetClose>

                          <SheetClose asChild>
                            <Link
                              to="/usuario"
                              className="flex items-center gap-3 px-3 py-3 text-sm text-white/75 transition hover:text-white"
                            >
                              <User className="h-4 w-4" />
                              <span>Usuário</span>
                            </Link>
                          </SheetClose>
                        </div>
                      )}
                    </div>
                  </nav>

                  {/* SAIR */}
                  <div className="border-t border-white/10 px-4 py-4">
                    <button
                      type="button"
                      onClick={sair}
                      className="flex w-full items-center gap-4 rounded-xl px-4 py-3.5 text-sm font-semibold text-red-400 transition hover:bg-white/10"
                    >
                      <LogOut className="h-6 w-6" />

                      <span>Sair</span>
                    </button>
                  </div>
                </div>
              </SheetContent>
            </Sheet>

            {/* LOGO */}
            <div className="ml-3 flex items-center">
              <img
                src={logo}
                alt="ANOTA"
                className="w-24 h-auto object-contain"
              />
            </div>

            {/* NOTIFICAÇÃO */}
            <button
              type="button"
              className="relative ml-auto flex h-10 w-10 items-center justify-center rounded-lg"
              aria-label="Notificações"
            >
              <Bell className="h-6 w-6" />

              <span className="absolute right-1 top-1 h-2.5 w-2.5 rounded-full bg-red-500" />
            </button>
          </div>
        </header>

        {/* MENU INFERIOR */}
        <nav className="fixed bottom-0 left-0 right-0 z-40 flex h-[72px] items-center justify-around border-t bg-white px-2 shadow-lg">
          <Link
            to="/dashboard"
            className="flex flex-col items-center justify-center gap-1 text-blue-600"
          >
            <Home className="h-6 w-6" />
            <span className="text-xs font-semibold">Início</span>
          </Link>

          <Link
            to="/receitas"
            className="flex flex-col items-center justify-center gap-1 text-slate-500"
          >
            <TrendingUp className="h-6 w-6" />
            <span className="text-xs">Receita</span>
          </Link>

          <Link
            to="/despesas"
            className="flex flex-col items-center justify-center gap-1 text-slate-500"
          >
            <TrendingDown className="h-6 w-6" />
            <span className="text-xs">Despesa</span>
          </Link>

          <Link
            to="/orcamento"
            className="flex flex-col items-center justify-center gap-1 text-slate-500"
          >
            <FileText className="h-6 w-6" />
            <span className="text-xs">Orçamento</span>
          </Link>
        </nav>
      </div>
    </>
  );
}
