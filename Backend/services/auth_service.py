from datetime import datetime

from flask_jwt_extended import create_access_token
from werkzeug.security import check_password_hash, generate_password_hash

from extensions import db
from models.usuario import Usuario
from exceptions.api_exception import BadRequest, Unauthorized, NotFound

class AuthService:

    @staticmethod
    def login(dados):

        usuario = Usuario.query.filter_by(
            email=dados["email"]
        ).first()

        if not usuario:
            raise Unauthorized("E-mail ou senha inválidos.")

        if not usuario.ativo:
            raise Unauthorized("Usuário desativado.")
        
        if usuario.empresa and usuario.empresa.deletado_em is not None:
            raise Unauthorized("Empresa desativada.")

        if not check_password_hash(
            usuario.senha_hash,
            dados["senha"]
        ):
            raise Unauthorized("E-mail ou senha inválidos.")

        token = create_access_token(
            identity=str(usuario.id),
            additional_claims={
                "empresa_id": usuario.empresa_id,
                "tipo": usuario.tipo
            }
        )

        usuario.ultimo_login = datetime.utcnow()

        db.session.commit()
        return token

    @staticmethod
    def register(dados):

        if not dados.get("nome"):
            raise BadRequest("Nome é obrigatório.")

        if not dados.get("email"):
            raise BadRequest("E-mail é obrigatório.")

        if not dados.get("senha"):
            raise BadRequest("Senha é obrigatória.")

        usuario_existente = Usuario.query.filter_by(
            email=dados["email"]
        ).first()

        if usuario_existente:
            raise BadRequest("E-mail já cadastrado.")

        usuario = Usuario(
            nome=dados["nome"],
            email=dados["email"],
            senha_hash=generate_password_hash(dados["senha"]),
            tipo="usuario",
            ativo=True,
            empresa_id=None
        )

        try:
            db.session.add(usuario)
            db.session.commit()

            return usuario

        except Exception:
            db.session.rollback()
            raise

        