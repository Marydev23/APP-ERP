from exceptions.api_exception import BadRequest, NotFound
from models.item_orcamento import ItemOrcamento
from models.orcamento import Orcamento
from extensions import db


class ItemOrcamentoService:

    @staticmethod
    def registrar(dados, empresa_id):

        if not dados.get("orcamento_id"):
            raise BadRequest("Orçamento é obrigatório")

        if not dados.get("descricao"):
            raise BadRequest("Descrição é obrigatória")

        if dados.get("quantidade") is None:
            raise BadRequest("Quantidade é obrigatória")

        if dados.get("preco_unitario") is None:
            raise BadRequest("Preço unitário é obrigatório")

        # Verifica se o orçamento pertence à empresa
        orcamento = Orcamento.query.filter_by(
            id=dados.get("orcamento_id"),
            empresa_id=empresa_id
        ).first()

        if not orcamento:
            raise NotFound("Orçamento não encontrado")

        quantidade = dados.get("quantidade")
        preco_unitario = dados.get("preco_unitario")

        valor_total = quantidade * preco_unitario

        item = ItemOrcamento(
            orcamento_id=dados.get("orcamento_id"),
            produto_id=dados.get("produto_id"),
            descricao=dados.get("descricao"),
            quantidade=quantidade,
            preco_unitario=preco_unitario,
            valor_total=valor_total
        )

        db.session.add(item)
        db.session.commit()

        return item

    @staticmethod
    def listar_por_orcamento(orcamento_id, empresa_id):

        orcamento = Orcamento.query.filter_by(
            id=orcamento_id,
            empresa_id=empresa_id
        ).first()

        if not orcamento:
            raise NotFound("Orçamento não encontrado")

        itens = ItemOrcamento.query.filter_by(
            orcamento_id=orcamento_id
        ).all()

        return itens

    @staticmethod
    def buscar_por_id(item_id, empresa_id):

        item = ItemOrcamento.query.join(
            Orcamento,
            ItemOrcamento.orcamento_id == Orcamento.id
        ).filter(
            ItemOrcamento.id == item_id,
            Orcamento.empresa_id == empresa_id
        ).first()

        if not item:
            raise NotFound("Item do orçamento não encontrado")

        return item

    @staticmethod
    def atualizar(item_id, dados, empresa_id):

        item = ItemOrcamentoService.buscar_por_id(
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

        if "produto_id" in dados:
            item.produto_id = dados["produto_id"]

        # Recalcula automaticamente
        item.valor_total = (
            item.quantidade * item.preco_unitario
        )

        db.session.commit()

        return item

    @staticmethod
    def excluir(item_id, empresa_id):

        item = ItemOrcamentoService.buscar_por_id(
            item_id,
            empresa_id
        )

        db.session.delete(item)

        db.session.commit()

        return item