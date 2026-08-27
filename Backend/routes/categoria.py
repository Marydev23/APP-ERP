from flask import Blueprint, request, jsonify
from flask_jwt_extended import get_jwt, jwt_required

from services.categoria_service import CategoriaService

categoria = Blueprint("categoria", __name__)


@categoria.route("/register", methods=["POST"])
@jwt_required()
def register():

    try:

        dados = request.get_json()

        claims = get_jwt()

        empresa_id = claims.get("empresa_id")

        nova_categoria = CategoriaService.registrar(
            dados,
            empresa_id
        )

        return jsonify({
            "mensagem": "Categoria cadastrada com sucesso.",
            "id": nova_categoria.id
        }), 201

    except Exception as e:
        return jsonify({
            "erro": str(e)
        }), 400
    
@categoria.route("/", methods=["GET"])
@jwt_required()
def listar():

    claims = get_jwt()
    empresa_id = claims["empresa_id"]

    categorias = CategoriaService.listar(empresa_id)

    return jsonify([
        {
            "id": categoria.id,
            "nome": categoria.nome,
            
        }
        for categoria in categorias
    ]), 200

@categoria.route("/<int:id>", methods = ["GET"])
@jwt_required()
def buscar_categoria(id):
    empresa_id = get_jwt()["empresa_id"]

    try:
        categoria = CategoriaService.buscar_por_id(
            id,
            empresa_id
        )

        return jsonify({
            "id": categoria.id,
            "nome": categoria.nome
        }), 200
    
    except ValueError as e:
        return jsonify({
            "erro": str(e)
        }), 404

@categoria.route("/<int:id>", methods=["PUT"])
@jwt_required()
def atualizar(id):
    dados = request.get_json()
    empresa_id = get_jwt()["empresa_id"]
    categoria=CategoriaService.atualizar(
        id,
        dados,
        empresa_id
    )
    return jsonify({
        "mensagem": "Categoria atualizado com sucesso.",
        "id": categoria.id
    }), 200

@categoria.route("/<int:id>", methods= ["DELETE"])
@jwt_required()
def deletar(id):
    empresa_id = get_jwt()["empresa_id"]
    CategoriaService.deletar(
        id,
        empresa_id
    )

    return jsonify({
        "mensagem": "Categoria removida com sucesso."
    }), 200

    