from datetime import datetime
from decimal import Decimal

from exceptions.api_exception import BadRequest, NotFound

from models.receita import Receita
from models.cliente import Cliente
from models.categoria import Categoria

from extensions import db


class ReceitaService:

    @staticmethod
    def registrar(dados, empresa_id):

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

        # Cliente é opcional
        cliente_id = dados.get("cliente_id")

        if cliente_id:

            cliente = Cliente.query.filter_by(
                id=cliente_id,
                empresa_id=empresa_id
            ).first()

            if not cliente:
                raise NotFound(
                    "Cliente não encontrado"
                )

        # Categoria é opcional
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

        # Data da receita
        try:

            data = datetime.strptime(
                dados.get("data"),
                "%Y-%m-%d"
            ).date()

        except (ValueError, TypeError):

            raise BadRequest(
                "Data inválida. Use o formato YYYY-MM-DD"
            )

        # Data de recebimento
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

        valor_total = valor - desconto

        receita = Receita(
            empresa_id=empresa_id,
            cliente_id=cliente_id,
            categoria_id=categoria_id,
            data=data,
            data_recebimento=data_recebimento,
            descricao=dados.get("descricao"),
            valor=valor,
            forma_pagamento=dados.get(
                "forma_pagamento"
            ),
            desconto=desconto,
            valor_total=valor_total,
            status=dados.get(
                "status",
                "PENDENTE"
            )
        )

        db.session.add(receita)
        db.session.commit()

        return receita

    @staticmethod
    def listar(empresa_id):

        receitas = Receita.query.filter_by(
            empresa_id=empresa_id,
            deletado_em=None
        ).order_by(
            Receita.data.desc()
        ).all()

        return receitas

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

            receita.cliente_id = cliente_id

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

        if "descricao" in dados:

            receita.descricao = dados["descricao"]

        if "forma_pagamento" in dados:

            receita.forma_pagamento = (
                dados["forma_pagamento"]
            )

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

        # Recalcula o valor total
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

        receita.valor_total = (
            valor - desconto
        )

        if "status" in dados:

            receita.status = dados["status"]

        db.session.commit()

        return receita

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