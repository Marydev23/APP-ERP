
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

            raise BadRequest(
                "Não foi possível cadastrar o usuário."
            )

    @staticmethod
    def buscar_por_id(usuario_id):

        usuario = Usuario.query.get(usuario_id)

        if not usuario:
            raise ValueError(
                "Usuário não encontrado."
            )

        return usuario

    @staticmethod
    def atualizar(usuario_id, dados):

        usuario = Usuario.query.get(usuario_id)

        if not usuario:
            raise ValueError(
                "Usuário não encontrado."
            )

        nome = dados.get("nome")
        email = dados.get("email")
        senha = dados.get("senha")

        if not nome:
            raise BadRequest(
                "Nome é obrigatório."
            )

        if not email:
            raise BadRequest(
                "E-mail é obrigatório."
            )

        outro_usuario = Usuario.query.filter(
            Usuario.email == email,
            Usuario.id != usuario.id
        ).first()

        if outro_usuario:
            raise BadRequest(
                "E-mail já cadastrado."
            )

        usuario.nome = nome
        usuario.email = email

        if senha:
            usuario.senha_hash = generate_password_hash(
                senha
            )

        try:
            db.session.commit()

            return usuario

        except Exception:
            db.session.rollback()

            raise BadRequest(
                "Não foi possível atualizar o usuário."
            )

