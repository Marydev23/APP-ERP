import datetime

from exceptions.api_exception import BadRequest, NotFound
from models.categoria import Categoria
from extensions import db


class CategoriaService:

    @staticmethod
    def registrar(dados, empresa_id):

        if not dados.get("nome"):
            raise BadRequest("Nome da categoria é obrigatório.")

        categoria_existente = Categoria.query.filter_by(
            empresa_id=empresa_id,
            nome=dados["nome"],
            deletado_em=None
        ).first()

        if categoria_existente:
            raise BadRequest("Categoria já cadastrada.")

        categoria = Categoria(
            empresa_id=empresa_id,
            nome=dados["nome"]
        )

        try:
            db.session.add(categoria)
            db.session.commit()
            return categoria

        except Exception:
            db.session.rollback()
            raise

    @staticmethod
    def listar(empresa_id):

        categoria = Categoria.query.filter_by(
            empresa_id=empresa_id
        ).all()

        return categoria
    
    @staticmethod
    def buscar_por_id(categoria_id, empresa_id):
        categoria = Categoria.query.filter_by(
            id = categoria_id,
            empresa_id = empresa_id
        ).first()

        if not categoria:
            raise NotFound("Categoria não encontrada.")
        
        return categoria



    @staticmethod
    def atualizar(categoria_id, dados, empresa_id):

        categoria = Categoria.query.filter_by(
            id=categoria_id,
            empresa_id=empresa_id,
            deletado_em=None
        ).first()

        if not categoria:
            raise NotFound("Categoria não encontrada.")

        if not dados.get("nome"):
            raise BadRequest("Nome da categoria é obrigatório.")

        categoria_existente = Categoria.query.filter(
            Categoria.id != categoria_id,
            Categoria.empresa_id == empresa_id,
            Categoria.nome == dados["nome"],
            Categoria.deletado_em.is_(None)
        ).first()

        if categoria_existente:
            raise BadRequest("Já existe uma categoria com esse nome.")

        categoria.nome = dados["nome"]

        db.session.commit()

        return categoria
        
    
    @staticmethod
    def deletar(categoria_id, empresa_id):

        categoria = Categoria.query.filter_by(
            id=categoria_id,
            empresa_id=empresa_id,
            deletado_em=None
        ).first()

        if not categoria:
            raise NotFound("Categoria não encontrada.")

        if categoria.produtos:
            raise BadRequest(
                "Não é possível remover esta categoria porque existem produtos vinculados."
            )

        if categoria.receitas:
            raise BadRequest(
                "Não é possível remover esta categoria porque existem receitas vinculadas."
            )

        if categoria.despesas:
            raise BadRequest(
                "Não é possível remover esta categoria porque existem despesas vinculadas."
            )

        categoria.deletado_em = datetime.utcnow()

        db.session.commit()

        return True