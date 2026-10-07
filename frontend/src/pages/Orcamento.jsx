import React, { useState, useEffect } from "react";
import { CardContent, CardTitle } from "@/components/ui/card";
import { jsPDF } from "jspdf";
import {
  CirclePlus,
  Receipt,
  Pencil,
  Trash,
  Download,
  Search,
  ArrowLeft,
  X,
  Plus,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function Orcamento() {
  const [cliente, setCliente] = useState("");
  const [cnpj, setCnpj] = useState("");
  const [endereco, setEndereco] = useState("");
  const [contato, setContato] = useState("");

  const [produtos, setProdutos] = useState([]);
  const [produtoSelecionado, setProdutoSelecionado] = useState("");
  const [precoUnitario, setPrecoUnitario] = useState("");
  const [quantidade, setQuantidade] = useState(1);

  const [nomeProduto, setNomeProduto] = useState("");
  const [categoria, setCategoria] = useState("");

  const [itens, setItens] = useState([]);
  const [frete, setFrete] = useState(0);
  const navigate = useNavigate();

  const [openModalProduto, setOpenModalProduto] = useState(false);
  const [openModalItem, setOpenModalItem] = useState(false);

  useEffect(() => {
    carregarProdutos();
  }, []);

  const carregarProdutos = async () => {
    try {
      const res = await fetch("http://localhost:5000/produtos");

      if (!res.ok) throw new Error("Erro ao buscar produtos");

      const data = await res.json();

      setProdutos(data);
    } catch (erro) {
      console.log("Erro ao buscar produtos:", erro);
    }
  };

  const selecionarProduto = (id) => {
    const idNum = Number(id);

    setProdutoSelecionado(idNum);

    setPrecoUnitario("");
  };

  const salvarProduto = async (e) => {
    e.preventDefault();

    try {
      const response = await fetch("http://localhost:5000/produtos", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          Nome_produto: nomeProduto,
          Valor_unitario: precoUnitario,
          CategoriaID: categoria,
        }),
      });

      if (!response.ok) {
        throw new Error("Erro ao cadastrar produto");
      }

      alert("Produto cadastrado com sucesso!");

      setNomeProduto("");
      setPrecoUnitario("");
      setCategoria("");
      setOpenModalProduto(false);

      carregarProdutos();
    } catch (erro) {
      console.log(erro);
      alert("Erro ao cadastrar produto");
    }
  };

  const adicionarProduto = () => {
    const produto = produtos.find((p) => p.id === produtoSelecionado);

    if (!produto) return;

    const novoItem = {
      id: produto.id,
      nome: produto.Nome_produto,
      quantidade: Number(quantidade),
      preco: Number(precoUnitario),
      total: Number(quantidade) * Number(precoUnitario),
    };

    setItens([...itens, novoItem]);

    setProdutoSelecionado("");
    setQuantidade(1);
    setPrecoUnitario("");
  };

  const removerItem = (index) => {
    const novaLista = itens.filter((_, i) => i !== index);

    setItens(novaLista);
  };

  const subtotal = itens.reduce((acc, item) => acc + item.total, 0);

  const totalGeral = subtotal + Number(frete);

  const salvarOrcamento = async () => {
    const dados = {
      cliente,
      cnpj,
      endereco,
      contato,
      frete,
      total: totalGeral,
      itens,
    };

    try {
      const res = await fetch("http://localhost:5000/orcamentos", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(dados),
      });

      if (!res.ok) {
        throw new Error("Erro ao salvar orçamento");
      }

      const result = await res.json();

      return result;
    } catch (erro) {
      console.log(erro);
      alert("Erro ao salvar orçamento");
    }
  };

  const limparOrcamento = () => {
    setCliente("");
    setCnpj("");
    setEndereco("");
    setContato("");
    setItens([]);
    setFrete(0);
  };

  const baixarPDF = async () => {
    await gerarPDF();

    limparOrcamento();
  };

  const excluirItem = (index) => {
    const novaLista = itens.filter((_, i) => i !== index);
    setItens(novaLista);
  };

  const editarItem = (index) => {
    const item = itens[index];

    setProdutoSelecionado(item.id);
    setQuantidade(item.quantidade);
    setPrecoUnitario(item.preco);

    excluirItem(index);

    setOpenModalItem(true);
  };
  // ===============================
  // EMPRESA
  // ===============================

  const buscarEmpresa = async () => {
    try {
      const res = await fetch("http://localhost:5000/empresa");

      if (!res.ok) throw new Error("Empresa não encontrada");

      const data = await res.json();

      return Array.isArray(data) ? data[0] : data;
    } catch (erro) {
      console.log("Erro ao buscar empresa:", erro);

      return null;
    }
  };

  const formatarMoeda = (valor) => {
    return Number(valor).toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL",
    });
  };

  //===============================
  // Loog da imagem
  // ===============================

  const carregarLogoBase64 = async (caminho) => {
    const url = `http://localhost:5000/${caminho.replace(/\\/g, "/")}`;

    const response = await fetch(url);
    const blob = await response.blob();

    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result);
      reader.readAsDataURL(blob);
    });
  };

  // ===============================
  // GERAR PDF
  // ===============================
  const gerarPDF = async () => {
    try {
      const empresa = await buscarEmpresa();

      const doc = new jsPDF("p", "mm", "a4");

      let logoBase64 = null;

      if (empresa?.logo) {
        logoBase64 = await carregarLogoBase64(empresa.logo);
      }

      if (logoBase64) {
        doc.addImage(logoBase64, "PNG", 14, 32, 16, 16);
      }

      const verde = [34, 94, 60];
      const cinza = [240, 240, 240];

      doc.setFillColor(...verde);
      doc.rect(0, 0, 210, 25, "F");

      // NOME EMPRESA
      doc.setFont("helvetica", "bold");
      doc.setFontSize(15);
      doc.setTextColor(255, 255, 255);
      doc.text(empresa?.nome || "Empresa", 105, 15, { align: "center" });
      doc.setFont("helvetica", "normal");
      doc.setFontSize(9);
      doc.text(empresa?.slogan || "", 35, 20);

      // ============================
      // DADOS EMPRESA
      // ============================

      doc.setTextColor(60);
      doc.setFontSize(9);

      doc.text(`CNPJ: ${empresa?.cnpj || ""}`, 35, 34);
      doc.text(`Endereço: ${empresa?.endereco || ""}`, 35, 40);
      doc.text(`Telefone: ${empresa?.telefone || ""}`, 35, 46);
      doc.text(`Contato: ${String(contato || "")}`, 15, 97);
      doc.text(`Email: ${empresa?.email || ""}`, 35, 52);
      // ============================
      // BLOCO ORÇAMENTO
      // ============================

      doc.setFillColor(...cinza);
      doc.roundedRect(150, 32, 50, 20, 3, 3, "F");

      doc.setFont("helvetica", "bold");
      doc.setFontSize(12);
      doc.setTextColor(...verde);
      doc.text("ORÇAMENTO", 175, 38, { align: "center" });

      doc.setFont("helvetica", "normal");
      doc.setFontSize(9);
      doc.setTextColor(80, 80, 80);
      doc.text(`Data: ${new Date().toLocaleDateString()}`, 175, 45, {
        align: "center",
      });

      let startY = 112;
      const col = {
        item: 15,
        desc: 35,
        qtd: 120,
        preco: 150,
        total: 180,
      };

      doc.setDrawColor(220);
      doc.line(10, 55, 200, 55);

      doc.setFillColor(...cinza);
      doc.roundedRect(10, 60, 190, 38, 3, 3, "F");

      // TÍTULO
      doc.setFont("helvetica", "bold");
      doc.setFontSize(11);
      doc.setTextColor(...verde);
      doc.text("DADOS DO CLIENTE", 15, 70);

      // LABELS
      doc.setFont("helvetica", "bold");
      doc.setFontSize(9);
      doc.setTextColor(100, 100, 100);

      doc.text("CLIENTE", 15, 80);
      doc.text("CNPJ / CPF", 110, 80);
      doc.text("ENDEREÇO", 15, 90);
      doc.text("CONTATO", 110, 90);

      // VALORES
      doc.setFont("helvetica", "normal");
      doc.setFontSize(10);
      doc.setTextColor(0, 0, 0);

      doc.text(String(cliente || "-"), 15, 85);
      doc.text(String(cnpj || "-"), 110, 85);
      doc.text(String(endereco || "-"), 15, 95);
      doc.text(String(contato || "-"), 110, 95);
      doc.setFillColor(...verde);
      doc.rect(10, startY - 6, 190, 8, "F");

      doc.setTextColor(255, 255, 255);
      doc.setFontSize(10);
      doc.setFont("helvetica", "bold");
      doc.text("ITEM", col.item, startY);
      doc.text("PRODUTO", col.desc, startY);
      doc.text("QTD", col.qtd, startY);
      doc.text("PREÇO", col.preco, startY);
      doc.text("TOTAL", col.total, startY);

      doc.setTextColor(0, 0, 0);
      doc.setFont("helvetica", "normal");

      startY += 8;

      itens.forEach((item, index) => {
        doc.text(`${index + 1}`, col.item, startY);
        doc.text(String(item.nome || ""), col.desc, startY);
        doc.text(`${item.quantidade}`, col.qtd, startY);
        doc.text(formatarMoeda(item.preco), col.preco, startY);
        doc.text(formatarMoeda(item.total), col.total, startY);

        startY += 7;

        if (startY > 270) {
          doc.addPage();
          startY = 20;
        }
      });

      startY += 10;

      doc.setFont("helvetica", "bold");
      doc.setFontSize(11);
      doc.text(`Subtotal: ${formatarMoeda(subtotal)}`, 125, startY + 8);
      doc.text(`Frete: ${formatarMoeda(frete)}`, 125, startY + 15);

      doc.setFillColor(...verde);
      doc.roundedRect(120, startY + 20, 80, 10, 3, 3, "F");

      doc.setTextColor(255, 255, 255);
      doc.setFontSize(12);
      doc.text(`TOTAL: ${formatarMoeda(totalGeral)}`, 160, startY + 27, {
        align: "center",
      });

      doc.setTextColor(80, 80, 80);
      doc.setFontSize(10);
      doc.text("Obrigado pela preferência!", 10, 285);

      // Salvar PDF
      doc.save(
        `Orcamento_${(cliente || "cliente").replace(/[^\w]/g, "_")}.pdf`,
      );
    } catch (erro) {
      console.log("Erro ao gerar PDF:", erro);
      alert("Erro ao gerar PDF");
    }
  };

  const buscarProdutos = async () => {
    try {
      const res = await fetch("http://localhost:5000/produtos");
      const produtos = await res.json();

      setProdutos(produtos);
    } catch (error) {
      console.log("Erro ao carregar produtos:", error);
    }
  };

  return (
    <div className="md:ml-64 min-h-screen bg-[#f7f9fc] pb-24">
      <div className="max-w-7xl mx-auto px-3 md:px-6 py-4 md:py-7">
        {/* =====================================================
          CABEÇALHO
      ====================================================== */}
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between mb-5 md:mb-7">
          <div className="flex items-center gap-3">
            {/* VOLTAR */}
            <button
              type="button"
              onClick={() => navigate("/dashboard")}
              className="
              w-10 h-10
              shrink-0
              rounded-xl
              bg-white
              border border-slate-200
              text-slate-600
              flex items-center justify-center
              hover:bg-slate-50
              hover:text-green-600
              hover:border-green-200
              transition
              shadow-sm
            "
              title="Voltar"
            >
              <ArrowLeft size={19} />
            </button>

            {/* ÍCONE */}
            <div className="w-11 h-11 md:w-12 md:h-12 rounded-2xl bg-green-50 flex items-center justify-center shrink-0">
              <Receipt className="w-6 h-6 md:w-7 md:h-7 text-green-600" />
            </div>

            {/* TÍTULO */}
            <div>
              <h1 className="text-xl md:text-3xl font-bold text-slate-800 tracking-tight">
                Orçamento
              </h1>

              <p className="text-xs md:text-sm text-slate-500 mt-0.5">
                Crie e organize seus orçamentos
              </p>
            </div>
          </div>

          {/* CADASTRAR PRODUTO */}
          <button
            type="button"
            onClick={() => setOpenModalProduto(true)}
            className="
            w-full md:w-auto
            h-11
            px-4
            rounded-xl
            bg-green-600
            hover:bg-green-700
            text-white
            text-sm
            font-semibold
            flex items-center justify-center gap-2
            shadow-sm
            transition
          "
          >
            <Plus size={18} />
            Cadastrar produto
          </button>
        </div>

        {/* =====================================================
          DADOS DO CLIENTE
      ====================================================== */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden mb-5">
          {/* CABEÇALHO DO CARD */}
          <div className="px-4 md:px-6 py-4 border-b border-slate-100 flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-green-50 flex items-center justify-center">
              <Receipt className="w-5 h-5 text-green-600" />
            </div>

            <div>
              <h2 className="text-base md:text-lg font-semibold text-slate-800">
                Dados do cliente
              </h2>

              <p className="text-xs text-slate-500">
                Informe os dados para o orçamento
              </p>
            </div>
          </div>

          {/* CAMPOS */}
          <div className="p-4 md:p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* CLIENTE */}
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1.5">
                  Cliente
                </label>

                <input
                  value={cliente}
                  onChange={(e) => setCliente(e.target.value)}
                  className="
                  w-full
                  h-11
                  px-3
                  rounded-xl
                  border border-slate-200
                  bg-slate-50
                  text-sm
                  text-slate-800
                  placeholder:text-slate-400
                  outline-none
                  focus:bg-white
                  focus:border-green-400
                  focus:ring-2
                  focus:ring-green-100
                  transition
                "
                  placeholder="Nome do cliente"
                />
              </div>

              {/* CNPJ / CPF */}
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1.5">
                  CNPJ / CPF
                </label>

                <input
                  value={cnpj}
                  onChange={(e) => setCnpj(e.target.value)}
                  className="
                  w-full
                  h-11
                  px-3
                  rounded-xl
                  border border-slate-200
                  bg-slate-50
                  text-sm
                  text-slate-800
                  placeholder:text-slate-400
                  outline-none
                  focus:bg-white
                  focus:border-green-400
                  focus:ring-2
                  focus:ring-green-100
                  transition
                "
                  placeholder="Digite o CNPJ ou CPF"
                />
              </div>

              {/* ENDEREÇO */}
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1.5">
                  Endereço
                </label>

                <input
                  value={endereco}
                  onChange={(e) => setEndereco(e.target.value)}
                  className="
                  w-full
                  h-11
                  px-3
                  rounded-xl
                  border border-slate-200
                  bg-slate-50
                  text-sm
                  text-slate-800
                  placeholder:text-slate-400
                  outline-none
                  focus:bg-white
                  focus:border-green-400
                  focus:ring-2
                  focus:ring-green-100
                  transition
                "
                  placeholder="Endereço do cliente"
                />
              </div>

              {/* CONTATO */}
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1.5">
                  Contato
                </label>

                <input
                  value={contato}
                  onChange={(e) => setContato(e.target.value)}
                  className="
                  w-full
                  h-11
                  px-3
                  rounded-xl
                  border border-slate-200
                  bg-slate-50
                  text-sm
                  text-slate-800
                  placeholder:text-slate-400
                  outline-none
                  focus:bg-white
                  focus:border-green-400
                  focus:ring-2
                  focus:ring-green-100
                  transition
                "
                  placeholder="Telefone ou WhatsApp"
                />
              </div>
            </div>

            {/* BOTÃO ADICIONAR */}
            <div className="mt-5">
              <button
                type="button"
                onClick={() => setOpenModalItem(true)}
                className="
                w-full md:w-auto
                h-11
                px-5
                rounded-xl
                bg-green-600
                hover:bg-green-700
                text-white
                text-sm
                font-semibold
                flex items-center justify-center gap-2
                transition
              "
              >
                <CirclePlus size={18} />
                Adicionar produto
              </button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-5">
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
            {/* CABEÇALHO */}
            <div className="px-4 md:px-6 py-4 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h2 className="text-base md:text-lg font-semibold text-slate-800">
                  Itens do orçamento
                </h2>

                <p className="text-xs text-slate-500 mt-0.5">
                  Produtos adicionados ao orçamento
                </p>
              </div>

              <div className="px-3 py-1.5 rounded-full bg-slate-100 text-slate-600 text-xs font-semibold">
                {itens.length} {itens.length === 1 ? "item" : "itens"}
              </div>
            </div>

            {/* DESKTOP - TABELA */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-100">
                    <th className="px-5 py-3 text-left text-xs font-semibold text-slate-500">
                      #
                    </th>

                    <th className="px-5 py-3 text-left text-xs font-semibold text-slate-500">
                      Produto
                    </th>

                    <th className="px-5 py-3 text-center text-xs font-semibold text-slate-500">
                      Qtd.
                    </th>

                    <th className="px-5 py-3 text-right text-xs font-semibold text-slate-500">
                      Preço
                    </th>

                    <th className="px-5 py-3 text-right text-xs font-semibold text-slate-500">
                      Total
                    </th>

                    <th className="px-5 py-3 text-center text-xs font-semibold text-slate-500">
                      Ações
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {itens.length === 0 ? (
                    <tr>
                      <td colSpan="6" className="py-14 text-center">
                        <div className="flex flex-col items-center justify-center">
                          <div className="w-14 h-14 rounded-2xl bg-slate-100 flex items-center justify-center mb-3">
                            <Search className="w-6 h-6 text-slate-400" />
                          </div>

                          <p className="text-sm font-medium text-slate-600">
                            Nenhum produto adicionado
                          </p>

                          <p className="text-xs text-slate-400 mt-1">
                            Adicione produtos para montar o orçamento
                          </p>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    itens.map((item, index) => (
                      <tr
                        key={index}
                        className="border-b border-slate-100 last:border-0 hover:bg-slate-50/70 transition"
                      >
                        <td className="px-5 py-4 text-sm text-slate-400">
                          {String(index + 1).padStart(2, "0")}
                        </td>

                        <td className="px-5 py-4">
                          <div className="font-medium text-slate-800 text-sm">
                            {item.nome}
                          </div>
                        </td>

                        <td className="px-5 py-4 text-center">
                          <span className="inline-flex min-w-8 justify-center px-2 py-1 rounded-lg bg-slate-100 text-slate-700 text-xs font-semibold">
                            {item.quantidade}
                          </span>
                        </td>

                        <td className="px-5 py-4 text-right text-sm text-slate-600">
                          {formatarMoeda(item.preco)}
                        </td>

                        <td className="px-5 py-4 text-right text-sm font-semibold text-slate-800">
                          {formatarMoeda(item.total)}
                        </td>

                        <td className="px-5 py-4">
                          <div className="flex justify-center gap-2">
                            <button
                              type="button"
                              onClick={() => editarItem(index)}
                              className="
                              w-8 h-8
                              rounded-lg
                              bg-blue-50
                              text-blue-600
                              flex items-center justify-center
                              hover:bg-blue-100
                              transition
                            "
                              title="Editar"
                            >
                              <Pencil size={15} />
                            </button>

                            <button
                              type="button"
                              onClick={() => excluirItem(index)}
                              className="
                              w-8 h-8
                              rounded-lg
                              bg-red-50
                              text-red-500
                              flex items-center justify-center
                              hover:bg-red-100
                              transition
                            "
                              title="Excluir"
                            >
                              <Trash size={15} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* =================================================
              MOBILE - CARDS DOS PRODUTOS
          ================================================== */}
            <div className="md:hidden">
              {itens.length === 0 ? (
                <div className="py-12 px-5 text-center">
                  <div className="w-14 h-14 rounded-2xl bg-slate-100 flex items-center justify-center mx-auto mb-3">
                    <Search className="w-6 h-6 text-slate-400" />
                  </div>

                  <p className="text-sm font-medium text-slate-600">
                    Nenhum produto adicionado
                  </p>

                  <p className="text-xs text-slate-400 mt-1">
                    Adicione produtos para montar o orçamento
                  </p>
                </div>
              ) : (
                <div className="p-3 space-y-3">
                  {itens.map((item, index) => (
                    <div
                      key={index}
                      className="
                      rounded-xl
                      border border-slate-100
                      bg-slate-50/70
                      p-3
                    "
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-[10px] font-bold text-slate-400">
                              #{String(index + 1).padStart(2, "0")}
                            </span>

                            <span className="text-sm font-semibold text-slate-800 truncate">
                              {item.nome}
                            </span>
                          </div>

                          <p className="text-xs text-slate-500">
                            {item.quantidade} x {formatarMoeda(item.preco)}
                          </p>
                        </div>

                        <div className="text-right shrink-0">
                          <p className="text-sm font-bold text-slate-800">
                            {formatarMoeda(item.total)}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center justify-end gap-2 mt-3 pt-3 border-t border-slate-200">
                        <button
                          type="button"
                          onClick={() => editarItem(index)}
                          className="
                          h-8
                          px-3
                          rounded-lg
                          bg-blue-50
                          text-blue-600
                          text-xs
                          font-semibold
                          flex items-center gap-1.5
                        "
                        >
                          <Pencil size={13} />
                          Editar
                        </button>

                        <button
                          type="button"
                          onClick={() => excluirItem(index)}
                          className="
                          h-8
                          px-3
                          rounded-lg
                          bg-red-50
                          text-red-500
                          text-xs
                          font-semibold
                          flex items-center gap-1.5
                        "
                        >
                          <Trash size={13} />
                          Excluir
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden h-fit">
            <div className="px-5 py-4 border-b border-slate-100">
              <h2 className="text-base font-semibold text-slate-800">Resumo</h2>

              <p className="text-xs text-slate-500 mt-0.5">
                Valores do orçamento
              </p>
            </div>

            <div className="p-5 space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-500">Subtotal</span>

                <span className="text-sm font-semibold text-slate-800">
                  {formatarMoeda(subtotal)}
                </span>
              </div>

              {/* FRETE */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-sm text-slate-500">Frete</label>

                  <span className="text-xs text-slate-400">Opcional</span>
                </div>

                <div className="relative">
                  <input
                    type="text"
                    value={frete === 0 ? "" : formatarMoeda(frete)}
                    onChange={(e) => {
                      const valor = e.target.value.replace(/\D/g, "");
                      setFrete(Number(valor) / 100);
                    }}
                    className="
                    w-full
                    h-10
                    px-3
                    rounded-xl
                    border border-slate-200
                    bg-slate-50
                    text-sm
                    text-right
                    outline-none
                    focus:bg-white
                    focus:border-green-400
                    focus:ring-2
                    focus:ring-green-100
                  "
                    placeholder="R$ 0,00"
                  />
                </div>
              </div>

              <div className="border-t border-slate-100" />

              {/* TOTAL */}
              <div className="rounded-2xl bg-green-600 p-4">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs text-green-100">
                    Total do orçamento
                  </span>
                </div>

                <p className="text-2xl font-bold text-white">
                  {formatarMoeda(totalGeral)}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-5 bg-white rounded-2xl border border-slate-100 shadow-sm p-4">
          <div className="flex flex-col-reverse md:flex-row md:justify-end gap-3">
            <button
              type="button"
              onClick={limparOrcamento}
              className="
              w-full md:w-auto
              h-11
              px-5
              rounded-xl
              bg-slate-100
              hover:bg-slate-200
              text-slate-600
              text-sm
              font-semibold
              transition
            "
            >
              Cancelar
            </button>

            <button
              type="button"
              onClick={async () => {
                await gerarPDF();
                limparOrcamento();
              }}
              className="
              w-full md:w-auto
              h-11
              px-5
              rounded-xl
              bg-blue-600
              hover:bg-blue-700
              text-white
              text-sm
              font-semibold
              flex items-center justify-center gap-2
              transition
            "
            >
              <Download size={17} />
              Baixar PDF
            </button>

            {/* SALVAR */}
            <button
              type="button"
              onClick={async () => {
                await salvarOrcamento();
                await gerarPDF();
                limparOrcamento();
              }}
              className="
              w-full md:w-auto
              h-11
              px-5
              rounded-xl
              bg-green-600
              hover:bg-green-700
              text-white
              text-sm
              font-semibold
              flex items-center justify-center gap-2
              shadow-sm
              transition
            "
            >
              <CirclePlus size={18} />
              Salvar orçamento
            </button>
          </div>
        </div>
      </div>

      {openModalProduto && (
        <div
          className="
        fixed inset-0
        z-50
        bg-slate-950/50
        backdrop-blur-sm
        flex items-end md:items-center justify-center
        p-0 md:p-4
      "
        >
          <form
            onSubmit={salvarProduto}
            className="
            relative
            w-full
            md:max-w-lg
            bg-white
            rounded-t-3xl md:rounded-3xl
            shadow-2xl
            p-5 md:p-6
          "
          >
            <button
              type="button"
              onClick={() => setOpenModalProduto(false)}
              className="
              absolute
              top-4
              right-4
              w-9 h-9
              rounded-xl
              bg-slate-100
              text-slate-500
              flex items-center justify-center
              hover:bg-slate-200
              transition
            "
            >
              <X size={18} />
            </button>

            <div className="flex items-center gap-3 mb-6">
              <div className="w-11 h-11 rounded-2xl bg-green-50 flex items-center justify-center">
                <CirclePlus className="w-6 h-6 text-green-600" />
              </div>

              <div>
                <h2 className="text-lg font-bold text-slate-800">
                  Cadastrar produto
                </h2>

                <p className="text-xs text-slate-500">
                  Adicione um novo produto ao sistema
                </p>
              </div>
            </div>

            <div className="mb-4">
              <label className="block text-xs font-semibold text-slate-600 mb-1.5">
                Nome do produto
              </label>

              <input
                value={nomeProduto}
                onChange={(e) => setNomeProduto(e.target.value)}
                className="
                w-full
                h-11
                px-3
                rounded-xl
                border border-slate-200
                bg-slate-50
                text-sm
                outline-none
                focus:bg-white
                focus:border-green-400
                focus:ring-2
                focus:ring-green-100
              "
                placeholder="Ex.: Vaso de cimento"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1.5">
                  Categoria
                </label>

                <select
                  value={categoria}
                  onChange={(e) => setCategoria(e.target.value)}
                  className="
                  w-full
                  h-11
                  px-3
                  rounded-xl
                  border border-slate-200
                  bg-slate-50
                  text-sm
                  outline-none
                  focus:bg-white
                  focus:border-green-400
                  focus:ring-2
                  focus:ring-green-100
                "
                >
                  <option value="">Selecione</option>

                  <option value="bacia">Vasos Bacia</option>

                  <option value="redondo">Vasos boca Redondos</option>

                  <option value="quadrado">Vasos boca Quadrados</option>

                  <option value="bonsai">Vasos Bonsai</option>

                  <option value="outros">Outros</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1.5">
                  Preço unitário
                </label>

                <input
                  type="text"
                  value={precoUnitario}
                  onChange={(e) => setPrecoUnitario(e.target.value)}
                  className="
                  w-full
                  h-11
                  px-3
                  rounded-xl
                  border border-slate-200
                  bg-slate-50
                  text-sm
                  outline-none
                  focus:bg-white
                  focus:border-green-400
                  focus:ring-2
                  focus:ring-green-100
                "
                  placeholder="R$ 0,00"
                />
              </div>
            </div>

            <div className="flex flex-col-reverse sm:flex-row justify-end gap-3 mt-6">
              <button
                type="button"
                onClick={() => setOpenModalProduto(false)}
                className="
                w-full sm:w-auto
                h-11
                px-5
                rounded-xl
                bg-slate-100
                hover:bg-slate-200
                text-slate-600
                text-sm
                font-semibold
              "
              >
                Cancelar
              </button>

              <button
                type="submit"
                className="
                w-full sm:w-auto
                h-11
                px-5
                rounded-xl
                bg-green-600
                hover:bg-green-700
                text-white
                text-sm
                font-semibold
                flex items-center justify-center gap-2
              "
              >
                <CirclePlus size={17} />
                Salvar produto
              </button>
            </div>
          </form>
        </div>
      )}

      {openModalItem && (
        <div
          className="
        fixed inset-0
        z-50
        bg-slate-950/50
        backdrop-blur-sm
        flex items-end md:items-center justify-center
        p-0 md:p-4
      "
        >
          <form
            onSubmit={(e) => {
              e.preventDefault();
              adicionarProduto();
              setOpenModalItem(false);
            }}
            className="
            relative
            w-full
            md:max-w-lg
            bg-white
            rounded-t-3xl md:rounded-3xl
            shadow-2xl
            p-5 md:p-6
          "
          >
            {/* FECHAR */}
            <button
              type="button"
              onClick={() => setOpenModalItem(false)}
              className="
              absolute
              top-4
              right-4
              w-9 h-9
              rounded-xl
              bg-slate-100
              text-slate-500
              flex items-center justify-center
              hover:bg-slate-200
              transition
            "
            >
              <X size={18} />
            </button>

            {/* TÍTULO */}
            <div className="flex items-center gap-3 mb-6">
              <div className="w-11 h-11 rounded-2xl bg-green-50 flex items-center justify-center">
                <CirclePlus className="w-6 h-6 text-green-600" />
              </div>

              <div>
                <h2 className="text-lg font-bold text-slate-800">
                  Adicionar produto
                </h2>

                <p className="text-xs text-slate-500">
                  Escolha o produto e informe a quantidade
                </p>
              </div>
            </div>

            {/* PRODUTO */}
            <div className="mb-4">
              <label className="block text-xs font-semibold text-slate-600 mb-1.5">
                Produto
              </label>

              <select
                value={produtoSelecionado}
                onChange={(e) => selecionarProduto(e.target.value)}
                className="
                w-full
                h-11
                px-3
                rounded-xl
                border border-slate-200
                bg-slate-50
                text-sm
                outline-none
                focus:bg-white
                focus:border-green-400
                focus:ring-2
                focus:ring-green-100
              "
              >
                <option value="">Selecione um produto</option>

                {produtos.map((produto) => (
                  <option key={produto.id} value={produto.id}>
                    {produto.Nome_produto}
                  </option>
                ))}
              </select>
            </div>

            {/* QUANTIDADE + PREÇO */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1.5">
                  Quantidade
                </label>

                <input
                  type="number"
                  min={1}
                  value={quantidade}
                  onChange={(e) => setQuantidade(e.target.value)}
                  className="
                  w-full
                  h-11
                  px-3
                  rounded-xl
                  border border-slate-200
                  bg-slate-50
                  text-sm
                  outline-none
                  focus:bg-white
                  focus:border-green-400
                  focus:ring-2
                  focus:ring-green-100
                "
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1.5">
                  Preço unitário
                </label>

                <input
                  type="number"
                  value={precoUnitario}
                  onChange={(e) => setPrecoUnitario(e.target.value)}
                  className="
                  w-full
                  h-11
                  px-3
                  rounded-xl
                  border border-slate-200
                  bg-slate-50
                  text-sm
                  outline-none
                  focus:bg-white
                  focus:border-green-400
                  focus:ring-2
                  focus:ring-green-100
                "
                  placeholder="0,00"
                />
              </div>
            </div>

            {/* BOTÕES */}
            <div className="flex flex-col-reverse sm:flex-row justify-end gap-3 mt-6">
              <button
                type="button"
                onClick={() => setOpenModalItem(false)}
                className="
                w-full sm:w-auto
                h-11
                px-5
                rounded-xl
                bg-slate-100
                hover:bg-slate-200
                text-slate-600
                text-sm
                font-semibold
              "
              >
                Cancelar
              </button>

              <button
                type="submit"
                className="
                w-full sm:w-auto
                h-11
                px-5
                rounded-xl
                bg-green-600
                hover:bg-green-700
                text-white
                text-sm
                font-semibold
                flex items-center justify-center gap-2
              "
              >
                <CirclePlus size={17} />
                Adicionar
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
