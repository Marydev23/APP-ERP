
from flask import Blueprint, request, jsonify

from flask_jwt_extended import jwt_required, get_jwt

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


@usuario.route("/me", methods=["GET"])
@jwt_required()
def meu_usuario():

    usuario_id = get_jwt()["sub"]

    try:
        usuario = UsuarioService.buscar_por_id(
            usuario_id
        )

        return jsonify({
            "id": usuario.id,
            "nome": usuario.nome,
            "email": usuario.email,
            "tipo": usuario.tipo,
            "ativo": usuario.ativo,
            "empresa_id": usuario.empresa_id
        }), 200

    except ValueError as e:

        return jsonify({
            "erro": str(e)
        }), 404

    except Exception as e:

        return jsonify({
            "erro": str(e)
        }), 500


@usuario.route("/me", methods=["PUT"])
@jwt_required()
def atualizar_meu_usuario():

    usuario_id = get_jwt()["sub"]
    dados = request.get_json()

    try:
        usuario = UsuarioService.atualizar(
            usuario_id,
            dados
        )

        return jsonify({
            "mensagem": "Usuário atualizado com sucesso.",
            "usuario": {
                "id": usuario.id,
                "nome": usuario.nome,
                "email": usuario.email,
                "tipo": usuario.tipo,
                "ativo": usuario.ativo,
                "empresa_id": usuario.empresa_id
            }
        }), 200

    except ValueError as e:

        return jsonify({
            "erro": str(e)
        }), 404

    except Exception as e:

        return jsonify({
            "erro": str(e)
        }), 400

