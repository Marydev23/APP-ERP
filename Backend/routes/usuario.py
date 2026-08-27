from flask import Blueprint, request, jsonify

from flask_jwt_extended import (
    jwt_required,
    get_jwt
)

from services.usuario_service import UsuarioService


usuario = Blueprint("usuario", __name__)


@usuario.route("/register", methods=["POST"])
@jwt_required()
def register():

    dados = request.get_json()

    claims = get_jwt()

    empresa_id = claims["empresa_id"]


    try:

        novo_usuario = UsuarioService.registrar(
            dados,
            empresa_id
        )


        return jsonify({
            "mensagem": "Usuário cadastrado com sucesso.",
            "id": novo_usuario.id
        }), 201


    except ValueError as e:

        return jsonify({
            "erro": str(e)
        }), 400