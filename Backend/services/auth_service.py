from datetime import datetime

from flask_jwt_extended import create_access_token
from werkzeug.security import check_password_hash

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