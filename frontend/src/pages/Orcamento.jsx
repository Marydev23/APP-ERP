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
} from "lucide-react";

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

  const [openModalProduto, setOpenModalProduto] = useState(false);
  const [openModalItem, setOpenModalItem] = useState(false);

  useEffect(() => {
    carregarProdutos();
  }, []);

  // ===============================
  // PRODUTOS
  // ===============================

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
    <div className="sm:ml-64 px-6 pt-1 max-w-7xl mx-auto">
      <div className="max-w-7xl mx-auto p-2">
        <CardContent>
          <div className="flex items-center justify-between">
            <CardTitle className="text-3xl font-semibold text-gray-800 tracking-tight">
              Gestão de Orçamentos
            </CardTitle>

            <button
              onClick={() => setOpenModalProduto(true)}
              className="w-40 bg-green-600 hover:bg-green-700 text-white text-sm font-medium py-2 rounded-md transition"
            >
              + Cadastrar Produto
            </button>
          </div>
        </CardContent>

        {openModalProduto && (
          <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
            <form
              onSubmit={salvarProduto}
              className="relative bg-white w-[450px] rounded-lg p-6 shadow-xl"
            >
              <button
                type="button"
                onClick={() => setOpenModalProduto(false)}
                className="absolute top-3 right-4 text-gray-500 hover:text-gray-800 text-lg"
              >
                ✕
              </button>

              <div className="flex items-center gap-2 mb-6">
                <CirclePlus className="w-6 h-6 text-green-600" />
                <CardTitle className="text-xl font-semibold text-gray-800">
                  Cadastrar Produto
                </CardTitle>
              </div>

              <div className="flex flex-col">
                <label className="text-sm font-medium text-gray-700">
                  Nome do Produto
                </label>

                <input
                  value={nomeProduto}
                  onChange={(e) => setNomeProduto(e.target.value)}
                  className="flex-1 border-b border-gray-300 bg-transparent py-2 focus:outline-none"
                  placeholder="Nome do produto"
                />
              </div>

              <div className="grid grid-cols-10 gap-5 py-3">
                <div className="col-span-5 flex flex-col">
                  <label className="text-sm font-medium text-slate-700">
                    Categoria
                  </label>
                  <select
                    value={categoria}
                    onChange={(e) => setCategoria(e.target.value)}
                    className="w-full h-10 border border-slate-300 rounded-lg
                    px-2  focus:ring-2 focus:ring-green-400
                    focus:outline-none"
                  >
                    <option value="">Selecione</option>
                    <option value="bacia">Vasos Bacia</option>
                    <option value="redondo">Vasos boca Redondos</option>
                    <option value="quadrado">Vasos boca Quadrados</option>
                    <option value="bonsai">Vasos Bonsai</option>
                    <option value="outros">Outros</option>
                  </select>
                </div>

                <div className="col-span-5 flex flex-col">
                  <label className="text-sm font-medium text-gray-700">
                    Preço Unitário
                  </label>

                  <input
                    type="text"
                    value={precoUnitario}
                    onChange={(e) => setPrecoUnitario(e.target.value)}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                    placeholder="R$ 0,00"
                  />
                </div>
              </div>

              <div className="flex justify-end pt-4">
                <button
                  type="submit"
                  className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md text-sm font-medium transition"
                >
                  <CirclePlus className="w-4 h-4" />
                  Salvar
                </button>
              </div>
            </form>
          </div>
        )}

        <CardContent className="flex gap-6 w-full">
          <form className="flex-1 bg-white rounded-2xl shadow-md p-6">
            <div className="flex items-center gap-2">
              <Receipt className="w-8 h-8 text-green-600" />
              <CardTitle className="text-xl font-semibold text-gray-800">
                Dados do Cliente
              </CardTitle>
            </div>
            <div className="w-full p-2 space-y-0.5">
              <div className="flex items-center gap-4">
                <label className="w-32 text-sm font-medium text-gray-700">
                  Cliente:
                </label>
                <input
                  value={cliente}
                  onChange={(e) => setCliente(e.target.value)}
                  className="flex-1 border-b border-gray-300 bg-transparent py-2 focus:outline-none"
                  placeholder="Nome do cliente"
                />
              </div>

              <div className="flex items-center gap-4">
                <label className="w-32 text-sm font-medium text-gray-700">
                  CNPJ/CPF:
                </label>
                <input
                  value={cnpj}
                  onChange={(e) => setCnpj(e.target.value)}
                  className="flex-1 border-b border-gray-300 bg-transparent py-2 focus:outline-none"
                  placeholder="Digite o CNPJ ou CPF"
                />
              </div>

              <div className="flex items-center gap-4">
                <label className="w-32 text-sm font-medium text-gray-700">
                  Endereço:
                </label>
                <input
                  value={endereco}
                  onChange={(e) => setEndereco(e.target.value)}
                  className="flex-1 border-b border-gray-300 bg-transparent py-2 focus:outline-none"
                  placeholder="Digite o endereço"
                />
              </div>

              <div className="flex items-center gap-4">
                <label className="w-32 text-sm font-medium text-gray-700">
                  Contato:
                </label>
                <input
                  value={contato}
                  onChange={(e) => setContato(e.target.value)}
                  className="flex-1 border-b border-gray-300 bg-transparent py-2 focus:outline-none"
                  placeholder="Digite o contato"
                />
              </div>
            </div>
            <div className="flex justify-start pt-6">
              <button
                type="button"
                onClick={() => setOpenModalItem(true)}
                className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white text-sm font-medium px-5 py-2 rounded-lg transition"
              >
                <CirclePlus className="w-5 h-5" />
                Adicionar Produtos
              </button>
            </div>
          </form>
        </CardContent>

        {/*                                              MODAL PRODUTO */}
        {openModalItem && (
          <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                adicionarProduto();
              }}
              className="relative bg-white w-[450px] rounded-lg p-6 shadow-xl"
            >
              <button
                type="button"
                onClick={() => setOpenModalItem(false)}
                className="absolute top-3 right-4 text-gray-500 hover:text-gray-800 text-lg"
              >
                ✕
              </button>

              <div className="flex items-center gap-2 mb-6">
                <CirclePlus className="w-6 h-6 text-green-600" />
                <CardTitle className="text-xl font-semibold text-gray-800">
                  Adicionar Produto
                </CardTitle>
              </div>

              <div className="flex flex-col mb-4">
                <label className="text-sm font-medium text-gray-700">
                  Produto
                </label>

                <select
                  value={produtoSelecionado}
                  onChange={(e) => selecionarProduto(e.target.value)}
                  className="border border-gray-300 rounded-md px-3 py-2"
                >
                  <option value="">Selecione</option>

                  {produtos.map((produto) => (
                    <option key={produto.id} value={produto.id}>
                      {produto.Nome_produto}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-10 gap-5 py-3">
                {/* QUANTIDADE */}
                <div className="col-span-5 flex flex-col">
                  <label className="text-sm font-medium text-gray-700">
                    Quantidade
                  </label>

                  <input
                    type="number"
                    min={1}
                    value={quantidade}
                    onChange={(e) => setQuantidade(e.target.value)}
                    className="w-full border border-gray-300 rounded-md px-3 py-2"
                  />
                </div>

                {/* PREÇO */}
                <div className="col-span-5 flex flex-col">
                  <label className="text-sm font-medium text-gray-700">
                    Preço Unitário
                  </label>

                  <input
                    type="number"
                    value={precoUnitario}
                    onChange={(e) => setPrecoUnitario(e.target.value)}
                    className="w-full border border-gray-300 rounded-md px-3 py-2"
                  />
                </div>
              </div>

              <div className="flex justify-end pt-4">
                <button
                  type="submit"
                  className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md text-sm font-medium transition"
                >
                  <CirclePlus className="w-4 h-4" />
                  Adicionar
                </button>
              </div>
            </form>
          </div>
        )}

        <div className="flex gap-6">
          <div className="flex-1 bg-white rounded-2xl shadow-md p-6">
            <div className="flex justify-between items-center mb-4">
              <CardTitle className="text-xl font-semibold text-slate-800">
                Itens do Orçamento
              </CardTitle>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="p-3 text-left">Item</th>
                    <th className="p-3 text-left">Quant.</th>
                    <th className="p-3 text-left">Descrição</th>
                    <th className="p-3 text-left">Preço Unit.</th>
                    <th className="p-3 text-left">Valor</th>
                    <th className="p-3 text-left">Ações</th>
                  </tr>
                </thead>

                <tbody>
                  {itens.length === 0 ? (
                    <tr>
                      <td colSpan="6" className="text-center p-4 text-gray-500">
                        Nenhum produto adicionado
                      </td>
                    </tr>
                  ) : (
                    itens.map((item, index) => (
                      <tr key={index} className="border-t">
                        <td className="p-3">{index + 1}</td>

                        <td className="p-3">{item.quantidade}</td>

                        <td className="p-3">{item.nome}</td>

                        <td className="p-3">
                          R$ {Number(item.preco).toFixed(2)}
                        </td>

                        <td className="p-3">
                          R$ {Number(item.total).toFixed(2)}
                        </td>

                        <td className="p-3">
                          <div className="flex gap-3">
                            <Pencil
                              size={16}
                              className="cursor-pointer"
                              onClick={() => editarItem(index)}
                            />

                            <Trash
                              size={16}
                              className="cursor-pointer"
                              onClick={() => excluirItem(index)}
                            />
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/*                                                     RESUMO DO ORÇAMENTO                               */}
          <div className="w-[260px] bg-white rounded-2xl shadow-md p-6 space-y-4">
            <CardTitle className="text-lg font-semibold text-slate-700">
              Resumo
            </CardTitle>

            <div className="bg-green-100 text-green-800 p-3 rounded-lg flex justify-between">
              <span>Subtotal</span>
              <span>{formatarMoeda(subtotal)}</span>{" "}
            </div>

            <div className="bg-yellow-100 text-yellow-800 p-3 rounded-lg flex justify-between items-center">
              <span>Frete</span>

              <input
                type="text"
                value={frete === 0 ? "" : formatarMoeda(frete)}
                onChange={(e) => {
                  const valor = e.target.value.replace(/\D/g, "");
                  setFrete(Number(valor) / 100);
                }}
                className="w-28 text-right bg-white border border-yellow-300 rounded px-2 py-1 outline-none"
                placeholder="R$ 0,00"
              />
            </div>

            <div className="bg-blue-100 text-blue-800 p-3 rounded-lg flex justify-between font-semibold">
              <span>Total Geral</span>
              <span>R$ {formatarMoeda(totalGeral)}</span>
            </div>
          </div>
        </div>
        {/*                                                     Botoes finais                             */}

        <div className="flex justify-end gap-3 mt-6">
          <button className="flex items-center gap-1 bg-slate-400 hover:bg-zinc-400 text-white text-sm font-medium px-4 py-1 rounded-lg">
            Cancelar
          </button>
          <button
            onClick={async () => {
              await salvarOrcamento();
              await gerarPDF();
              limparOrcamento();
            }}
            className="flex items-center gap-1 bg-green-600 hover:bg-green-700 text-white text-sm font-medium px-4 py-1 rounded-lg"
          >
            <CirclePlus className="w-5 h-5" />
            Salvar Orçamento
          </button>

          <button
            onClick={() => {
              gerarPDF();
              limparOrcamento();
            }}
            className="flex items-center gap-1 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium px-4 py-1 rounded-lg"
          >
            <Download className="w-5 h-5" />
            Baixar PDF
          </button>
        </div>
      </div>
    </div>
  );
}
