
from exceptions.api_exception import BadRequest, NotFound

from extensions import db

from models.taxa_pagamento import TaxaPagamento
from models.forma_pagamento import FormaPagamento


class TaxaPagamentoService:

    # ==========================================================
    # CADASTRAR TAXA
    # ==========================================================

    @staticmethod
    def registrar(dados, empresa_id):

        forma_pagamento_id = dados.get("forma_pagamento_id")
        parcelas = dados.get("parcelas", 1)
        percentual = dados.get("percentual", 0)

        if not forma_pagamento_id:
            raise BadRequest("Forma de pagamento é obrigatória")

        if parcelas < 1:
            raise BadRequest("Quantidade de parcelas deve ser maior que zero")

        if percentual < 0:
            raise BadRequest("Percentual da taxa não pode ser negativo")

        # Verifica se a forma de pagamento pertence à empresa
        forma_pagamento = FormaPagamento.query.filter_by(
            id=forma_pagamento_id,
            empresa_id=empresa_id
        ).first()

        if not forma_pagamento:
            raise NotFound(
                "Forma de pagamento não encontrada"
            )

        # Evita duplicidade
        taxa_existente = TaxaPagamento.query.filter_by(
            forma_pagamento_id=forma_pagamento_id,
            parcelas=parcelas
        ).first()

        if taxa_existente:
            raise BadRequest(
                "Já existe uma taxa cadastrada para esta forma de pagamento e quantidade de parcelas"
            )

        taxa = TaxaPagamento(
            forma_pagamento_id=forma_pagamento_id,
            parcelas=parcelas,
            percentual=percentual,
            ativo=True
        )

        db.session.add(taxa)
        db.session.commit()

        return TaxaPagamentoService._to_dict(taxa)

    # ==========================================================
    # LISTAR TAXAS
    # ==========================================================

    @staticmethod
    def listar(empresa_id):

        taxas = (
            TaxaPagamento.query
            .join(FormaPagamento)
            .filter(
                FormaPagamento.empresa_id == empresa_id
            )
            .order_by(TaxaPagamento.id)
            .all()
        )

        return [
            TaxaPagamentoService._to_dict(taxa)
            for taxa in taxas
        ]

    # ==========================================================
    # BUSCAR POR ID
    # ==========================================================

    @staticmethod
    def buscar_por_id(taxa_id, empresa_id):

        taxa = (
            TaxaPagamento.query
            .join(FormaPagamento)
            .filter(
                TaxaPagamento.id == taxa_id,
                FormaPagamento.empresa_id == empresa_id
            )
            .first()
        )

        if not taxa:
            raise NotFound(
                "Taxa de pagamento não encontrada"
            )

        return TaxaPagamentoService._to_dict(taxa)

    # ==========================================================
    # ATUALIZAR TAXA
    # ==========================================================

    @staticmethod
    def atualizar(taxa_id, dados, empresa_id):

        taxa = (
            TaxaPagamento.query
            .join(FormaPagamento)
            .filter(
                TaxaPagamento.id == taxa_id,
                FormaPagamento.empresa_id == empresa_id
            )
            .first()
        )

        if not taxa:
            raise NotFound(
                "Taxa de pagamento não encontrada"
            )

        parcelas = dados.get(
            "parcelas",
            taxa.parcelas
        )

        percentual = dados.get(
            "percentual",
            taxa.percentual
        )

        ativo = dados.get(
            "ativo",
            taxa.ativo
        )

        if parcelas < 1:
            raise BadRequest(
                "Quantidade de parcelas deve ser maior que zero"
            )

        if percentual < 0:
            raise BadRequest(
                "Percentual da taxa não pode ser negativo"
            )

        # Verifica duplicidade caso parcelas sejam alteradas
        taxa_existente = TaxaPagamento.query.filter(
            TaxaPagamento.forma_pagamento_id == taxa.forma_pagamento_id,
            TaxaPagamento.parcelas == parcelas,
            TaxaPagamento.id != taxa.id
        ).first()

        if taxa_existente:
            raise BadRequest(
                "Já existe uma taxa cadastrada para esta forma de pagamento e quantidade de parcelas"
            )

        taxa.parcelas = parcelas
        taxa.percentual = percentual
        taxa.ativo = ativo

        db.session.commit()

        return TaxaPagamentoService._to_dict(taxa)

    # ==========================================================
    # EXCLUIR TAXA
    # ==========================================================

    @staticmethod
    def excluir(taxa_id, empresa_id):

        taxa = (
            TaxaPagamento.query
            .join(FormaPagamento)
            .filter(
                TaxaPagamento.id == taxa_id,
                FormaPagamento.empresa_id == empresa_id
            )
            .first()
        )

        if not taxa:
            raise NotFound(
                "Taxa de pagamento não encontrada"
            )

        db.session.delete(taxa)
        db.session.commit()

    # ==========================================================
    # CONVERTER PARA JSON
    # ==========================================================

    @staticmethod
    def _to_dict(taxa):

        return {
            "id": taxa.id,
            "forma_pagamento_id": taxa.forma_pagamento_id,
            "forma_pagamento": taxa.forma_pagamento.nome,
            "parcelas": taxa.parcelas,
            "percentual": float(taxa.percentual),
            "ativo": taxa.ativo,
            "criado_em": taxa.criado_em.isoformat()
            if taxa.criado_em else None,
            "atualizado_em": taxa.atualizado_em.isoformat()
            if taxa.atualizado_em else None
        }
