from decimal import Decimal, InvalidOperation

from exceptions.api_exception import BadRequest, NotFound

from models.venda import Venda
from models.cliente import Cliente

from extensions import db


class VendaService:

    @staticmethod
    def registrar(dados, empresa_id):

        cliente_id = dados.get("cliente_id")

        # Cliente é opcional
        if cliente_id:

            cliente = Cliente.query.filter_by(
                id=cliente_id,
                empresa_id=empresa_id
            ).first()

            if not cliente:
                raise NotFound(
                    "Cliente não encontrado"
                )

        # Forma de pagamento
        forma_pagamento = dados.get(
            "forma_pagamento"
        )

        if not forma_pagamento:
            raise BadRequest(
                "Forma de pagamento é obrigatória"
            )

        forma_pagamento = forma_pagamento.upper()

        formas_validas = [
            "DINHEIRO",
            "PIX",
            "DEBITO",
            "CREDITO",
            "BOLETO"
        ]

        if forma_pagamento not in formas_validas:
            raise BadRequest(
                "Forma de pagamento inválida"
            )

        # Parcelas
        parcelas = dados.get("parcelas", 1)

        try:
            parcelas = int(parcelas)

        except (ValueError, TypeError):
            raise BadRequest(
                "Número de parcelas inválido"
            )

        if parcelas < 1:
            raise BadRequest(
                "Número de parcelas deve ser maior que zero"
            )

        # Só permite parcelamento no crédito
        if forma_pagamento != "CREDITO" and parcelas != 1:
            raise BadRequest(
                "Parcelamento disponível somente para crédito"
            )

        # Desconto
        try:
            desconto = Decimal(
                str(dados.get("desconto", 0))
            )

        except (InvalidOperation, ValueError, TypeError):
            raise BadRequest(
                "Desconto inválido"
            )

        if desconto < 0:
            raise BadRequest(
                "Desconto não pode ser negativo"
            )

        # Taxa
        try:
            percentual_taxa = Decimal(
                str(dados.get("percentual_taxa", 0))
            )

        except (InvalidOperation, ValueError, TypeError):
            raise BadRequest(
                "Percentual da taxa inválido"
            )

        if percentual_taxa < 0:
            raise BadRequest(
                "Percentual da taxa não pode ser negativo"
            )

        # Subtotal
        # Uma venda nova começa sem itens
        subtotal = Decimal("0.00")

        # O desconto não pode ser maior que o subtotal
        if desconto > subtotal:
            raise BadRequest(
                "Desconto não pode ser maior que o subtotal"
            )

        # Calcula a taxa
        valor_base = subtotal - desconto

        taxa_pagamento = (
            valor_base * percentual_taxa / Decimal("100")
        )

        total = (
            valor_base + taxa_pagamento
        )

        venda = Venda(
            empresa_id=empresa_id,
            cliente_id=cliente_id,
            subtotal=subtotal,
            desconto=desconto,
            taxa_pagamento=taxa_pagamento,
            percentual_taxa=percentual_taxa,
            total=total,
            forma_pagamento=forma_pagamento,
            parcelas=parcelas,
            status=dados.get(
                "status",
                "FINALIZADA"
            ),
            observacao=dados.get(
                "observacao"
            )
        )

        db.session.add(venda)
        db.session.commit()

        return venda

    @staticmethod
    def listar(empresa_id):

        vendas = Venda.query.filter_by(
            empresa_id=empresa_id,
            deletado_em=None
        ).order_by(
            Venda.id.desc()
        ).all()

        return vendas

    @staticmethod
    def buscar_por_id(
        venda_id,
        empresa_id
    ):

        venda = Venda.query.filter_by(
            id=venda_id,
            empresa_id=empresa_id,
            deletado_em=None
        ).first()

        if not venda:
            raise NotFound(
                "Venda não encontrada"
            )

        return venda

    @staticmethod
    def atualizar(
        venda_id,
        dados,
        empresa_id
    ):

        venda = VendaService.buscar_por_id(
            venda_id,
            empresa_id
        )

        # Cliente
        if "cliente_id" in dados:

            cliente_id = dados["cliente_id"]

            if cliente_id:

                cliente = Cliente.query.filter_by(
                    id=cliente_id,
                    empresa_id=empresa_id
                ).first()

                if not cliente:
                    raise NotFound(
                        "Cliente não encontrado"
                    )

            venda.cliente_id = cliente_id

        # Forma de pagamento
        if "forma_pagamento" in dados:

            forma_pagamento = (
                dados["forma_pagamento"]
                .upper()
            )

            formas_validas = [
                "DINHEIRO",
                "PIX",
                "DEBITO",
                "CREDITO",
                "BOLETO"
            ]

            if forma_pagamento not in formas_validas:
                raise BadRequest(
                    "Forma de pagamento inválida"
                )

            venda.forma_pagamento = (
                forma_pagamento
            )

        # Parcelas
        if "parcelas" in dados:

            try:
                parcelas = int(
                    dados["parcelas"]
                )

            except (ValueError, TypeError):
                raise BadRequest(
                    "Número de parcelas inválido"
                )

            if parcelas < 1:
                raise BadRequest(
                    "Número de parcelas deve ser maior que zero"
                )

            venda.parcelas = parcelas

        # Desconto
        if "desconto" in dados:

            try:
                desconto = Decimal(
                    str(dados["desconto"])
                )

            except (InvalidOperation, ValueError, TypeError):
                raise BadRequest(
                    "Desconto inválido"
                )

            if desconto < 0:
                raise BadRequest(
                    "Desconto não pode ser negativo"
                )

            venda.desconto = desconto

        # Percentual da taxa
        if "percentual_taxa" in dados:

            try:
                percentual_taxa = Decimal(
                    str(dados["percentual_taxa"])
                )

            except (InvalidOperation, ValueError, TypeError):
                raise BadRequest(
                    "Percentual da taxa inválido"
                )

            if percentual_taxa < 0:
                raise BadRequest(
                    "Percentual da taxa não pode ser negativo"
                )

            venda.percentual_taxa = (
                percentual_taxa
            )

        if "status" in dados:
            venda.status = dados["status"]

        if "observacao" in dados:
            venda.observacao = dados["observacao"]

        # ==========================================
        # RECALCULA
        # ==========================================

        subtotal = sum(
            (
                item.valor_total or Decimal("0.00")
                for item in venda.itens
            ),
            Decimal("0.00")
        )

        desconto = (
            venda.desconto
            or Decimal("0.00")
        )

        percentual_taxa = (
            venda.percentual_taxa
            or Decimal("0.00")
        )

        if desconto > subtotal:
            raise BadRequest(
                "Desconto não pode ser maior que o subtotal"
            )

        valor_base = subtotal - desconto

        taxa_pagamento = (
            valor_base
            * percentual_taxa
            / Decimal("100")
        )

        total = (
            valor_base
            + taxa_pagamento
        )

        venda.subtotal = subtotal
        venda.taxa_pagamento = taxa_pagamento
        venda.total = total

        db.session.commit()

        return venda

    @staticmethod
    def recalcular(
        venda_id,
        empresa_id
    ):

        venda = VendaService.buscar_por_id(
            venda_id,
            empresa_id
        )

        subtotal = sum(
            (
                item.valor_total or Decimal("0.00")
                for item in venda.itens
            ),
            Decimal("0.00")
        )

        desconto = (
            venda.desconto
            or Decimal("0.00")
        )

        percentual_taxa = (
            venda.percentual_taxa
            or Decimal("0.00")
        )

        if desconto > subtotal:
            raise BadRequest(
                "Desconto não pode ser maior que o subtotal"
            )

        valor_base = subtotal - desconto

        taxa_pagamento = (
            valor_base
            * percentual_taxa
            / Decimal("100")
        )

        total = (
            valor_base
            + taxa_pagamento
        )

        venda.subtotal = subtotal
        venda.taxa_pagamento = taxa_pagamento
        venda.total = total

        db.session.commit()

        return venda

    @staticmethod
    def excluir(
        venda_id,
        empresa_id
    ):

        venda = VendaService.buscar_por_id(
            venda_id,
            empresa_id
        )

        venda.deletado_em = db.func.now()

        db.session.commit()

        return venda