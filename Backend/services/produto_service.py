from datetime import datetime

from extensions import db

from models.produto import Produto

from exceptions.api_exception import (
    BadRequest,
    NotFound
)


class ProdutoService:

    # ======================================================
    # CADASTRAR
    # ======================================================

    @staticmethod
    def registrar(dados, empresa_id):

        if not dados.get("nome"):
            raise BadRequest(
                "Nome do produto é obrigatório."
            )

        produto_existente = Produto.query.filter_by(
            empresa_id=empresa_id,
            nome=dados["nome"],
            deletado_em=None
        ).first()

        if produto_existente:
            raise BadRequest(
                "Produto já cadastrado."
            )

        produto = Produto(
            empresa_id=empresa_id,
            categoria_id=dados.get("categoria_id"),
            nome=dados["nome"],
            descricao=dados.get("descricao"),
            valor_unitario=dados["valor_unitario"],
            estoque=dados.get("estoque", 0),
            ativo=dados.get("ativo", True)
        )

        try:

            db.session.add(produto)
            db.session.commit()

            return produto

        except Exception:

            db.session.rollback()
            raise BadRequest(
                "Não foi possível cadastrar o produto."
            )


    # ======================================================
    # LISTAR
    # ======================================================

    @staticmethod
    def listar(empresa_id):

        produtos = Produto.query.filter_by(
            empresa_id=empresa_id,
            deletado_em=None
        ).all()

        return produtos


    # ======================================================
    # BUSCAR POR ID
    # ======================================================

    @staticmethod
    def buscar_por_id(produto_id, empresa_id):

        produto = Produto.query.filter_by(
            id=produto_id,
            empresa_id=empresa_id,
            deletado_em=None
        ).first()

        if not produto:
            raise NotFound(
                "Produto não encontrado."
            )

        return produto


    # ======================================================
    # ATUALIZAR
    # ======================================================

    @staticmethod
    def atualizar(produto_id, dados, empresa_id):

        produto = Produto.query.filter_by(
            id=produto_id,
            empresa_id=empresa_id,
            deletado_em=None
        ).first()

        if not produto:
            raise NotFound(
                "Produto não encontrado."
            )

        # ----------------------------------------------
        # Se o nome foi enviado, verifica duplicidade
        # ----------------------------------------------

        if "nome" in dados:

            produto_existente = Produto.query.filter(
                Produto.id != produto_id,
                Produto.empresa_id == empresa_id,
                Produto.nome == dados["nome"],
                Produto.deletado_em.is_(None)
            ).first()

            if produto_existente:
                raise BadRequest(
                    "Já existe um produto com esse nome."
                )

            produto.nome = dados["nome"]

        # ----------------------------------------------
        # Atualizações opcionais
        # ----------------------------------------------

        if "descricao" in dados:
            produto.descricao = dados["descricao"]

        if "valor_unitario" in dados:
            produto.valor_unitario = dados["valor_unitario"]

        if "estoque" in dados:
            produto.estoque = dados["estoque"]

        if "ativo" in dados:
            produto.ativo = dados["ativo"]

        if "categoria_id" in dados:
            produto.categoria_id = dados["categoria_id"]

        db.session.commit()

        return produto


    # ======================================================
    # DELETAR
    # ======================================================

    @staticmethod
    def deletar(produto_id, empresa_id):

        produto = Produto.query.filter_by(
            id=produto_id,
            empresa_id=empresa_id,
            deletado_em=None
        ).first()

        if not produto:
            raise NotFound(
                "Produto não encontrado."
            )

        produto.deletado_em = datetime.utcnow()

        db.session.commit()

        return True