from flask import Blueprint, request, jsonify
from services.empresa_service import EmpresaService
from flask_jwt_extended import (
    jwt_required,
    get_jwt
)

empresa_bp = Blueprint("empresa", __name__)

@empresa_bp.route("/register", methods=["POST"])

def register():

    dados = request.get_json()

    try:
        empresa = EmpresaService.registrar(dados)

        return jsonify({
            "mensagem": "Empresa cadastrada com sucesso.",
            "id": empresa.id
        }), 201

    except ValueError as e:
        return jsonify({
            "erro": str(e)
        }), 400
    

@empresa_bp.route("/", methods=["GET"])
@jwt_required()
def listar():

    claims = get_jwt()

    empresa_id = claims["empresa_id"]

    try:

        empresa = EmpresaService.listar(
            empresa_id
        )

        return jsonify({
            "id": empresa.id,
            "nome": empresa.nome,
            "cnpj": empresa.cnpj,
            "email": empresa.email,
            "telefone": empresa.telefone,
            "cidade": empresa.cidade,
            "estado": empresa.estado,
            "endereco": empresa.endereco,
            "cep": empresa.cep,
            
        }), 200

    except ValueError as e:

        return jsonify({
            "erro": str(e)
        }), 404


@empresa_bp.route("/", methods=["PUT"])
@jwt_required()
def atualizar():

    dados = request.get_json()

    empresa_id = get_jwt()["empresa_id"]

    try:

        empresa = EmpresaService.atualizar(
            empresa_id,
            dados
        )

        return jsonify({
            "mensagem": "Empresa atualizada com sucesso.",
            "empresa": {
                "id": empresa.id,
                "nome": empresa.nome,
                "cnpj": empresa.cnpj,
                "email": empresa.email,
                "telefone": empresa.telefone,
                "cidade": empresa.cidade,
                "estado": empresa.estado,
                "endereco": empresa.endereco,
                "cep": empresa.cep,
                "site": empresa.site,
                "instagram": empresa.instagram,
                "slogan": empresa.slogan,
                "logo": empresa.logo
            }
        }), 200

    except ValueError as e:

        return jsonify({
            "erro": str(e)
        }), 404

    except Exception as e:

        return jsonify({
            "erro": str(e)
        }), 500
    
    
@empresa_bp.route("/", methods=["DELETE"])
@jwt_required()
def deletar():

    empresa_id = get_jwt()["empresa_id"]

    try:

        EmpresaService.deletar(empresa_id) 

        return jsonify({
            "mensagem": "Empresa excluída com sucesso."
        }), 200

    except ValueError as e:

        return jsonify({
            "erro": str(e)
        }), 404

    except Exception:

        return jsonify({
            "erro": "Erro ao excluir empresa."
        }), 500


