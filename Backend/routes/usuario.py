
from flask import Blueprint, request, jsonify

from services.usuario_service import UsuarioService


usuario = Blueprint("usuario", __name__)


@usuario.route("/register", methods=["POST"])
def register():

    dados = request.get_json()

    try:
        novo_usuario = UsuarioService.registrar(
            dados,
            None
        )

        return jsonify({
            "mensagem": "Usuário cadastrado com sucesso.",
            "id": novo_usuario.id
        }), 201

    except ValueError as e:

        return jsonify({
            "erro": str(e)
        }), 400
