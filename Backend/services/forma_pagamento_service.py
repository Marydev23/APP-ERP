
from exceptions.api_exception import BadRequest, NotFound

from models.forma_pagamento import FormaPagamento

from extensions import db


class FormaPagamentoService:

    @staticmethod
    def registrar(dados, empresa_id):

        if not dados:
            raise BadRequest(
                "Dados da forma de pagamento são obrigatórios."
            )

        if not dados.get("nome"):
            raise BadRequest(
                "Nome da forma de pagamento é obrigatório."
            )

        if not dados.get("tipo"):
            raise BadRequest(
                "Tipo da forma de pagamento é obrigatório."
            )

        forma_existente = FormaPagamento.query.filter_by(
            empresa_id=empresa_id,
            nome=dados["nome"]
        ).first()

        if forma_existente:
            raise BadRequest(
                "Essa forma de pagamento já está cadastrada."
            )

        forma = FormaPagamento(
            empresa_id=empresa_id,
            nome=dados["nome"],
            tipo=dados["tipo"],
            ativo=dados.get("ativo", True)
        )

        try:

            db.session.add(forma)
            db.session.commit()

            return forma

        except Exception:

            db.session.rollback()

            raise BadRequest(
                "Não foi possível cadastrar a forma de pagamento."
            )

    # ==========================================
    # LISTAR
    # ==========================================

    @staticmethod
    def listar(empresa_id):

        return FormaPagamento.query.filter_by(
            empresa_id=empresa_id
        ).all()

    # ==========================================
    # BUSCAR POR ID
    # ==========================================

    @staticmethod
    def buscar_por_id(forma_id, empresa_id):

        forma = FormaPagamento.query.filter_by(
            id=forma_id,
            empresa_id=empresa_id
        ).first()

        if not forma:
            raise NotFound(
                "Forma de pagamento não encontrada."
            )

        return forma

    # ==========================================
    # ATUALIZAR
    # ==========================================

    @staticmethod
    def atualizar(forma_id, dados, empresa_id):

        forma = FormaPagamentoService.buscar_por_id(
            forma_id,
            empresa_id
        )

        if "nome" in dados:

            if not dados["nome"]:
                raise BadRequest(
                    "Nome da forma de pagamento é obrigatório."
                )

            forma.nome = dados["nome"]

        if "tipo" in dados:

            if not dados["tipo"]:
                raise BadRequest(
                    "Tipo da forma de pagamento é obrigatório."
                )

            forma.tipo = dados["tipo"]

        if "ativo" in dados:

            forma.ativo = dados["ativo"]

        db.session.commit()

        return forma

    # ==========================================
    # EXCLUIR
    # ==========================================

    @staticmethod
    def excluir(forma_id, empresa_id):

        forma = FormaPagamentoService.buscar_por_id(
            forma_id,
            empresa_id
        )

        db.session.delete(forma)

        db.session.commit()

        return forma