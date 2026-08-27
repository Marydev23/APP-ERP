from exceptions.api_exception import BadRequest, NotFound
from models.item_venda import ItemVenda
from models.venda import Venda
from extensions import db


class ItemVendaService:

    @staticmethod
    def registrar(dados, empresa_id):

        if not dados.get("venda_id"):
            raise BadRequest("Venda é obrigatória")

        if not dados.get("descricao"):
            raise BadRequest("Descrição é obrigatória")

        if dados.get("quantidade") is None:
            raise BadRequest("Quantidade é obrigatória")

        if dados.get("preco_unitario") is None:
            raise BadRequest("Preço unitário é obrigatório")

        # Verifica se a venda pertence à empresa do usuário
        venda = Venda.query.filter_by(
            id=dados.get("venda_id"),
            empresa_id=empresa_id
        ).first()

        if not venda:
            raise NotFound("Venda não encontrada")

        quantidade = dados.get("quantidade")
        preco_unitario = dados.get("preco_unitario")
        desconto = dados.get("desconto", 0)

        valor_total = (
            quantidade * preco_unitario
        ) - desconto

        if valor_total < 0:
            raise BadRequest(
                "O desconto não pode ser maior que o valor do item"
            )

        item = ItemVenda(
            venda_id=dados.get("venda_id"),
            produto_id=dados.get("produto_id"),
            descricao=dados.get("descricao"),
            quantidade=quantidade,
            preco_unitario=preco_unitario,
            desconto=desconto,
            valor_total=valor_total
        )

        db.session.add(item)
        db.session.commit()

        return item

    @staticmethod
    def listar_por_venda(venda_id, empresa_id):

        venda = Venda.query.filter_by(
            id=venda_id,
            empresa_id=empresa_id
        ).first()

        if not venda:
            raise NotFound("Venda não encontrada")

        itens = ItemVenda.query.filter_by(
            venda_id=venda_id
        ).all()

        return itens

    @staticmethod
    def buscar_por_id(item_id, empresa_id):

        item = ItemVenda.query.join(
            Venda,
            ItemVenda.venda_id == Venda.id
        ).filter(
            ItemVenda.id == item_id,
            Venda.empresa_id == empresa_id
        ).first()

        if not item:
            raise NotFound("Item da venda não encontrado")

        return item

    @staticmethod
    def atualizar(item_id, dados, empresa_id):

        item = ItemVendaService.buscar_por_id(
            item_id,
            empresa_id
        )

        if "descricao" in dados:

            if not dados["descricao"]:
                raise BadRequest("Descrição é obrigatória")

            item.descricao = dados["descricao"]

        if "quantidade" in dados:

            if dados["quantidade"] is None:
                raise BadRequest("Quantidade é obrigatória")

            item.quantidade = dados["quantidade"]

        if "preco_unitario" in dados:

            if dados["preco_unitario"] is None:
                raise BadRequest("Preço unitário é obrigatório")

            item.preco_unitario = dados["preco_unitario"]

        if "desconto" in dados:

            item.desconto = dados["desconto"]

        if "produto_id" in dados:

            item.produto_id = dados["produto_id"]

        # Recalcula o valor total
        item.valor_total = (
            item.quantidade * item.preco_unitario
        ) - item.desconto

        if item.valor_total < 0:
            raise BadRequest(
                "O desconto não pode ser maior que o valor do item"
            )

        db.session.commit()

        return item

    @staticmethod
    def excluir(item_id, empresa_id):

        item = ItemVendaService.buscar_por_id(
            item_id,
            empresa_id
        )

        db.session.delete(item)

        db.session.commit()

        return item