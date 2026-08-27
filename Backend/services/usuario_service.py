from werkzeug.security import generate_password_hash

from exceptions.api_exception import BadRequest
from models.usuario import Usuario
from extensions import db


class UsuarioService:

    @staticmethod
    def registrar(dados, empresa_id):

        if not dados.get("nome"):
            raise BadRequest("Nome é obrigatório")

        if not dados.get("email"):
            raise BadRequest("E-mail é obrigatório")

        if not dados.get("senha"):
            raise BadRequest("Senha é obrigatória")


        usuario_existente = Usuario.query.filter_by(
            email=dados["email"]
        ).first()


        if usuario_existente:
            raise BadRequest("E-mail já cadastrado")


        usuario = Usuario(
            empresa_id=empresa_id,
            nome=dados["nome"],
            email=dados["email"],
            senha_hash=generate_password_hash(
                dados["senha"]
            ),
            tipo=dados.get("tipo", "USUARIO")
        )


        try:
            db.session.add(usuario)
            db.session.commit()

            return usuario

        except Exception:
            db.session.rollback()
            raise BadRequest("Não foi possível cadastrar o usuário.")