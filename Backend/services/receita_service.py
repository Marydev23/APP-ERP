from datetime import datetime
from decimal import Decimal

from exceptions.api_exception import BadRequest, NotFound

from models.receita import Receita
from models.categoria import Categoria
from models.forma_pagamento import FormaPagamento
from models.taxa_pagamento import TaxaPagamento

from services.cliente_service import ClienteService

from extensions import db


class ReceitaService:

    # ==========================================================
    # REGISTRAR RECEITA
    # ==========================================================

    @staticmethod
    def registrar(dados, empresa_id):

        # ======================================================
        # VALIDAÇÕES INICIAIS
        # ======================================================

        if not dados.get("data"):
            raise BadRequest(
                "Data da receita é obrigatória"
            )

        if dados.get("valor") is None:
            raise BadRequest(
                "Valor é obrigatório"
            )

        try:
            valor = Decimal(
                str(dados.get("valor"))
            )

            desconto = Decimal(
                str(dados.get("desconto", 0))
            )

        except (ValueError, TypeError):
            raise BadRequest(
                "Valor ou desconto inválido"
            )

        if valor < 0:
            raise BadRequest(
                "Valor não pode ser negativo"
            )

        if desconto < 0:
            raise BadRequest(
                "Desconto não pode ser negativo"
            )

        if desconto > valor:
            raise BadRequest(
                "Desconto não pode ser maior que o valor"
            )

        # ======================================================
        # CLIENTE
        # ======================================================

        cliente_nome = dados.get("cliente_nome")

        cliente = ClienteService.buscar_ou_criar_por_nome(
            cliente_nome,
            empresa_id
        )

        cliente_id = cliente.id if cliente else None

        # ======================================================
        # CATEGORIA
        # ======================================================

        categoria_id = dados.get("categoria_id")

        if categoria_id:

            categoria = Categoria.query.filter_by(
                id=categoria_id,
                empresa_id=empresa_id
            ).first()

            if not categoria:
                raise NotFound(
                    "Categoria não encontrada"
                )

        # ======================================================
        # DATA DA RECEITA
        # ======================================================

        try:

            data = datetime.strptime(
                dados.get("data"),
                "%Y-%m-%d"
            ).date()

        except (ValueError, TypeError):

            raise BadRequest(
                "Data inválida. Use o formato YYYY-MM-DD"
            )

        # ======================================================
        # DATA DE RECEBIMENTO
        # ======================================================

        data_recebimento = None

        if dados.get("data_recebimento"):

            try:

                data_recebimento = datetime.strptime(
                    dados.get("data_recebimento"),
                    "%Y-%m-%d"
                ).date()

            except (ValueError, TypeError):

                raise BadRequest(
                    "Data de recebimento inválida. "
                    "Use o formato YYYY-MM-DD"
                )

        # ======================================================
        # VALOR APÓS DESCONTO
        # ======================================================

        valor_total = valor - desconto

        # ======================================================
        # TAXA DA FORMA DE PAGAMENTO
        # ======================================================

        forma_pagamento_nome = dados.get(
            "forma_pagamento"
        )

        taxa_percentual = Decimal("0.00")
        taxa_valor = Decimal("0.00")

        if forma_pagamento_nome:

            taxa = TaxaPagamento.query.join(
                TaxaPagamento.forma_pagamento
            ).filter(
                TaxaPagamento.parcelas == 1,
                TaxaPagamento.ativo == True,
                TaxaPagamento.forma_pagamento.has(
                    empresa_id=empresa_id,
                    nome=forma_pagamento_nome
                )
            ).first()

            if taxa:

                taxa_percentual = Decimal(
                    str(taxa.percentual)
                )

                taxa_valor = (
                    valor_total * taxa_percentual
                ) / Decimal("100")

        # ======================================================
        # VALOR LÍQUIDO
        # ======================================================

        valor_liquido = (
            valor_total - taxa_valor
        )

        # ======================================================
        # CRIAR RECEITA
        # ======================================================

        receita = Receita(

            empresa_id=empresa_id,

            cliente_id=cliente_id,

            categoria_id=categoria_id,

            data=data,

            data_recebimento=data_recebimento,

            descricao=dados.get("descricao"),

            valor=valor,

            forma_pagamento=forma_pagamento_nome,

            desconto=desconto,

            taxa_percentual=taxa_percentual,

            taxa_valor=taxa_valor,

            valor_total=valor_liquido,

            status=dados.get(
                "status",
                "PENDENTE"
            )
        )

        db.session.add(receita)

        db.session.commit()

        return receita

    # ==========================================================
    # LISTAR RECEITAS
    # ==========================================================

    @staticmethod
    def listar(empresa_id):

        receitas = Receita.query.filter_by(
            empresa_id=empresa_id,
            deletado_em=None
        ).order_by(
            Receita.data.desc()
        ).all()

        return receitas

    # ==========================================================
    # BUSCAR RECEITA
    # ==========================================================

    @staticmethod
    def buscar_por_id(
        receita_id,
        empresa_id
    ):

        receita = Receita.query.filter_by(
            id=receita_id,
            empresa_id=empresa_id,
            deletado_em=None
        ).first()

        if not receita:

            raise NotFound(
                "Receita não encontrada"
            )

        return receita

    # ==========================================================
    # ATUALIZAR RECEITA
    # ==========================================================

    @staticmethod
    def atualizar(
        receita_id,
        dados,
        empresa_id
    ):

        receita = ReceitaService.buscar_por_id(
            receita_id,
            empresa_id
        )

        # ======================================================
        # CLIENTE
        # ======================================================

        if "cliente_nome" in dados:

            cliente_nome = dados.get(
                "cliente_nome"
            )

            cliente = ClienteService.buscar_ou_criar_por_nome(
                cliente_nome,
                empresa_id
            )

            receita.cliente_id = (
                cliente.id
                if cliente
                else None
            )

        # ======================================================
        # CATEGORIA
        # ======================================================

        if "categoria_id" in dados:

            categoria_id = dados["categoria_id"]

            if categoria_id:

                categoria = Categoria.query.filter_by(
                    id=categoria_id,
                    empresa_id=empresa_id
                ).first()

                if not categoria:

                    raise NotFound(
                        "Categoria não encontrada"
                    )

            receita.categoria_id = categoria_id

        # ======================================================
        # DATA
        # ======================================================

        if "data" in dados:

            try:

                receita.data = datetime.strptime(
                    dados["data"],
                    "%Y-%m-%d"
                ).date()

            except (ValueError, TypeError):

                raise BadRequest(
                    "Data inválida. "
                    "Use o formato YYYY-MM-DD"
                )

        # ======================================================
        # DATA DE RECEBIMENTO
        # ======================================================

        if "data_recebimento" in dados:

            if dados["data_recebimento"]:

                try:

                    receita.data_recebimento = datetime.strptime(
                        dados["data_recebimento"],
                        "%Y-%m-%d"
                    ).date()

                except (ValueError, TypeError):

                    raise BadRequest(
                        "Data de recebimento inválida. "
                        "Use o formato YYYY-MM-DD"
                    )

            else:

                receita.data_recebimento = None

        # ======================================================
        # DESCRIÇÃO
        # ======================================================

        if "descricao" in dados:

            receita.descricao = dados["descricao"]

        # ======================================================
        # FORMA DE PAGAMENTO
        # ======================================================

        if "forma_pagamento" in dados:

            receita.forma_pagamento = (
                dados["forma_pagamento"]
            )

        # ======================================================
        # VALOR
        # ======================================================

        if "valor" in dados:

            try:

                valor = Decimal(
                    str(dados["valor"])
                )

            except (ValueError, TypeError):

                raise BadRequest(
                    "Valor inválido"
                )

            if valor < 0:

                raise BadRequest(
                    "Valor não pode ser negativo"
                )

            receita.valor = valor

        # ======================================================
        # DESCONTO
        # ======================================================

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

            receita.desconto = desconto

        # ======================================================
        # RECALCULAR VALORES E TAXA
        # ======================================================

        valor = (
            receita.valor
            or Decimal("0.00")
        )

        desconto = (
            receita.desconto
            or Decimal("0.00")
        )

        if desconto > valor:

            raise BadRequest(
                "Desconto não pode ser maior que o valor"
            )

        valor_total = valor - desconto

        taxa_percentual = Decimal("0.00")
        taxa_valor = Decimal("0.00")

        if receita.forma_pagamento:

            taxa = TaxaPagamento.query.join(
                TaxaPagamento.forma_pagamento
            ).filter(
                TaxaPagamento.parcelas == 1,
                TaxaPagamento.ativo == True,
                TaxaPagamento.forma_pagamento.has(
                    empresa_id=empresa_id,
                    nome=receita.forma_pagamento
                )
            ).first()

            if taxa:

                taxa_percentual = Decimal(
                    str(taxa.percentual)
                )

                taxa_valor = (
                    valor_total * taxa_percentual
                ) / Decimal("100")

        valor_liquido = (
            valor_total - taxa_valor
        )

        receita.taxa_percentual = taxa_percentual

        receita.taxa_valor = taxa_valor

        receita.valor_total = valor_liquido

        # ======================================================
        # STATUS
        # ======================================================

        if "status" in dados:

            receita.status = dados["status"]

        # ======================================================
        # SALVAR
        # ======================================================

        db.session.commit()

        return receita

    # ==========================================================
    # EXCLUIR RECEITA
    # ==========================================================

    @staticmethod
    def excluir(
        receita_id,
        empresa_id
    ):

        receita = ReceitaService.buscar_por_id(
            receita_id,
            empresa_id
        )

        receita.deletado_em = db.func.now()

        db.session.commit()

        return receita
        # ==========================================================
    # MARCAR RECEITA COMO PAGA
    # ==========================================================
    @staticmethod
    def marcar_como_paga(
        receita_id,
        empresa_id
    ):
        receita = ReceitaService.buscar_por_id(
            receita_id,
            empresa_id
        )

        receita.status = "Pago"

        db.session.commit()

        return receita