from decimal import Decimal

from exceptions.api_exception import BadRequest, NotFound

from models.orcamento import Orcamento
from models.cliente import Cliente

from extensions import db


class OrcamentoService:

    @staticmethod
    def registrar(dados, empresa_id):

        if not dados.get("cliente_id"):
            raise BadRequest("Cliente é obrigatório")

        # Verifica se o cliente pertence à empresa
        cliente = Cliente.query.filter_by(
            id=dados.get("cliente_id"),
            empresa_id=empresa_id
        ).first()

        if not cliente:
            raise NotFound("Cliente não encontrado")

        try:
            frete = Decimal(
                str(dados.get("frete", 0))
            )

            desconto = Decimal(
                str(dados.get("desconto", 0))
            )

        except (ValueError, TypeError):
            raise BadRequest(
                "Frete ou desconto inválido"
            )

        if frete < 0:
            raise BadRequest(
                "Frete não pode ser negativo"
            )

        if desconto < 0:
            raise BadRequest(
                "Desconto não pode ser negativo"
            )

        # Um orçamento novo começa sem itens
        subtotal = Decimal("0.00")

        total = (
            subtotal
            - desconto
            + frete
        )

        if total < 0:
            raise BadRequest(
                "Desconto não pode ser maior que o subtotal"
            )

        orcamento = Orcamento(
            empresa_id=empresa_id,
            cliente_id=dados.get("cliente_id"),
            frete=frete,
            desconto=desconto,
            subtotal=subtotal,
            total=total,
            status=dados.get(
                "status",
                "RASCUNHO"
            ),
            observacao=dados.get("observacao")
        )

        db.session.add(orcamento)
        db.session.commit()

        return orcamento

    @staticmethod
    def listar(empresa_id):

        orcamentos = Orcamento.query.filter_by(
            empresa_id=empresa_id,
            deletado_em=None
        ).order_by(
            Orcamento.id.desc()
        ).all()

        return orcamentos

    @staticmethod
    def buscar_por_id(orcamento_id, empresa_id):

        orcamento = Orcamento.query.filter_by(
            id=orcamento_id,
            empresa_id=empresa_id,
            deletado_em=None
        ).first()

        if not orcamento:
            raise NotFound(
                "Orçamento não encontrado"
            )

        return orcamento

    @staticmethod
    def atualizar(orcamento_id, dados, empresa_id):

        orcamento = OrcamentoService.buscar_por_id(
            orcamento_id,
            empresa_id
        )

        if "cliente_id" in dados:

            cliente = Cliente.query.filter_by(
                id=dados["cliente_id"],
                empresa_id=empresa_id
            ).first()

            if not cliente:
                raise NotFound(
                    "Cliente não encontrado"
                )

            orcamento.cliente_id = dados["cliente_id"]

        if "frete" in dados:

            try:
                frete = Decimal(
                    str(dados["frete"])
                )
            except (ValueError, TypeError):
                raise BadRequest(
                    "Frete inválido"
                )

            if frete < 0:
                raise BadRequest(
                    "Frete não pode ser negativo"
                )

            orcamento.frete = frete

        if "desconto" in dados:

            try:
                desconto = Decimal(
                    str(dados["desconto"])
                )
            except (ValueError, TypeError):
                raise BadRequest(
                    "Desconto inválido"
                )

            if desconto < 0:
                raise BadRequest(
                    "Desconto não pode ser negativo"
                )

            orcamento.desconto = desconto

        if "status" in dados:
            orcamento.status = dados["status"]

        if "observacao" in dados:
            orcamento.observacao = dados["observacao"]

        # Recalcula o total usando os itens atuais
        subtotal = sum(
            (
                item.valor_total or Decimal("0.00")
                for item in orcamento.itens
            ),
            Decimal("0.00")
        )

        orcamento.subtotal = subtotal

        total = (
            subtotal
            - (orcamento.desconto or Decimal("0.00"))
            + (orcamento.frete or Decimal("0.00"))
        )

        if total < 0:
            raise BadRequest(
                "Desconto não pode ser maior que o subtotal"
            )

        orcamento.total = total

        db.session.commit()

        return orcamento

    @staticmethod
    def recalcular(orcamento_id, empresa_id):

        orcamento = OrcamentoService.buscar_por_id(
            orcamento_id,
            empresa_id
        )

        subtotal = sum(
            (
                item.valor_total or Decimal("0.00")
                for item in orcamento.itens
            ),
            Decimal("0.00")
        )

        desconto = (
            orcamento.desconto
            or Decimal("0.00")
        )

        frete = (
            orcamento.frete
            or Decimal("0.00")
        )

        total = (
            subtotal
            - desconto
            + frete
        )

        if total < 0:
            raise BadRequest(
                "Desconto não pode ser maior que o subtotal"
            )

        orcamento.subtotal = subtotal
        orcamento.total = total

        db.session.commit()

        return orcamento

    @staticmethod
    def excluir(orcamento_id, empresa_id):

        orcamento = OrcamentoService.buscar_por_id(
            orcamento_id,
            empresa_id
        )

        orcamento.deletado_em = db.func.now()

        db.session.commit()

        return orcamento