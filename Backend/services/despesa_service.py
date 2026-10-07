from datetime import datetime
from decimal import Decimal

from exceptions.api_exception import BadRequest, NotFound

from models.despesa import Despesa
from models.categoria import Categoria

from extensions import db


class DespesaService:

    @staticmethod
    def registrar(dados, empresa_id):

        if not dados.get("nome"):
            raise BadRequest("Nome da despesa é obrigatório")

        if dados.get("valor") is None:
            raise BadRequest("Valor é obrigatório")

        if not dados.get("data_vencimento"):
            raise BadRequest(
                "Data de vencimento é obrigatória"
            )

        try:
            valor = Decimal(
                str(dados.get("valor"))
            )

        except (ValueError, TypeError):
            raise BadRequest("Valor inválido")

        if valor < 0:
            raise BadRequest(
                "Valor não pode ser negativo"
            )

        categoria_id = dados.get("categoria_id")

        # Categoria é opcional
        if categoria_id:

            categoria = Categoria.query.filter_by(
                id=categoria_id,
                empresa_id=empresa_id
            ).first()

            if not categoria:
                raise NotFound(
                    "Categoria não encontrada"
                )

        try:
            data_vencimento = datetime.strptime(
                dados.get("data_vencimento"),
                "%Y-%m-%d"
            ).date()

        except (ValueError, TypeError):
            raise BadRequest(
                "Data de vencimento inválida. "
                "Use o formato YYYY-MM-DD"
            )

        data_pagamento = None

        if dados.get("data_pagamento"):

            try:
                data_pagamento = datetime.strptime(
                    dados.get("data_pagamento"),
                    "%Y-%m-%d"
                ).date()

            except (ValueError, TypeError):
                raise BadRequest(
                    "Data de pagamento inválida. "
                    "Use o formato YYYY-MM-DD"
                )

        despesa = Despesa(
            empresa_id=empresa_id,
            categoria_id=categoria_id,
            nome=dados.get("nome"),
            descricao=dados.get("descricao"),
            valor=valor,
            data_vencimento=data_vencimento,
            data_pagamento=data_pagamento,
            status=dados.get(
                "status",
                "PENDENTE"
            )
        )

        db.session.add(despesa)
        db.session.commit()

        return despesa

    @staticmethod
    def listar(empresa_id):

        despesas = Despesa.query.filter_by(
            empresa_id=empresa_id,
            deletado_em=None
        ).order_by(
            Despesa.data_vencimento.asc()
        ).all()

        return despesas

    @staticmethod
    def buscar_por_id(despesa_id, empresa_id):

        despesa = Despesa.query.filter_by(
            id=despesa_id,
            empresa_id=empresa_id,
            deletado_em=None
        ).first()

        if not despesa:
            raise NotFound(
                "Despesa não encontrada"
            )

        return despesa

    @staticmethod
    def atualizar(
        despesa_id,
        dados,
        empresa_id
    ):

        despesa = DespesaService.buscar_por_id(
            despesa_id,
            empresa_id
        )

        if "nome" in dados:

            if not dados["nome"]:
                raise BadRequest(
                    "Nome da despesa é obrigatório"
                )

            despesa.nome = dados["nome"]

        if "descricao" in dados:
            despesa.descricao = dados["descricao"]

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

            despesa.valor = valor

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

            despesa.categoria_id = categoria_id

        if "data_vencimento" in dados:

            try:
                despesa.data_vencimento = datetime.strptime(
                    dados["data_vencimento"],
                    "%Y-%m-%d"
                ).date()

            except (ValueError, TypeError):
                raise BadRequest(
                    "Data de vencimento inválida. "
                    "Use o formato YYYY-MM-DD"
                )

        if "data_pagamento" in dados:

            if dados["data_pagamento"]:

                try:
                    despesa.data_pagamento = datetime.strptime(
                        dados["data_pagamento"],
                        "%Y-%m-%d"
                    ).date()

                except (ValueError, TypeError):
                    raise BadRequest(
                        "Data de pagamento inválida. "
                        "Use o formato YYYY-MM-DD"
                    )

            else:
                despesa.data_pagamento = None

        if "status" in dados:
            despesa.status = dados["status"]

        db.session.commit()

        return despesa

    @staticmethod
    def excluir(despesa_id, empresa_id):

        despesa = DespesaService.buscar_por_id(
            despesa_id,
            empresa_id
        )

        despesa.deletado_em = db.func.now()

        db.session.commit()

        return despesa