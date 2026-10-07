from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt

from services.funcionario_service import FuncionarioService


funcionario_bp = Blueprint(
    "funcionario",
    __name__
)


@funcionario_bp.route("/", methods=["POST"])
@jwt_required()
def registrar():

    try:

        dados = request.get_json()

        claims = get_jwt()

        empresa_id = claims.get("empresa_id")

        funcionario = FuncionarioService.registrar(
            dados,
            empresa_id
        )

        return jsonify({
            "mensagem": "Funcionário cadastrado com sucesso",
            "funcionario": {
                "id": funcionario.id,
                "empresa_id": funcionario.empresa_id,
                "nome": funcionario.nome,
                "cargo": funcionario.cargo,
                "endereco": funcionario.endereco,
                "telefone": funcionario.telefone,
                "valor_salario": str(funcionario.valor_salario)
                if funcionario.valor_salario is not None else None,
                "data_admissao": funcionario.data_admissao.isoformat()
                if funcionario.data_admissao else None,
                "data_demissao": funcionario.data_demissao.isoformat()
                if funcionario.data_demissao else None,
                "status": funcionario.status
            }
        }), 201

    except Exception as e:

        return jsonify({
            "erro": str(e)
        }), 500


@funcionario_bp.route("/", methods=["GET"])
@jwt_required()
def listar():

    try:

        claims = get_jwt()

        empresa_id = claims.get("empresa_id")

        funcionarios = FuncionarioService.listar(
            empresa_id
        )

        return jsonify([
            {
                "id": funcionario.id,
                "empresa_id": funcionario.empresa_id,
                "nome": funcionario.nome,
                "cargo": funcionario.cargo,
                "endereco": funcionario.endereco,
                "telefone": funcionario.telefone,
                "valor_salario": str(funcionario.valor_salario)
                if funcionario.valor_salario is not None else None,
                "data_admissao": funcionario.data_admissao.isoformat()
                if funcionario.data_admissao else None,
                "data_demissao": funcionario.data_demissao.isoformat()
                if funcionario.data_demissao else None,
                "status": funcionario.status
            }
            for funcionario in funcionarios
        ]), 200

    except Exception as e:

        return jsonify({
            "erro": str(e)
        }), 500


@funcionario_bp.route("/<int:funcionario_id>", methods=["GET"])
@jwt_required()
def buscar(funcionario_id):

    try:

        claims = get_jwt()

        empresa_id = claims.get("empresa_id")

        funcionario = FuncionarioService.buscar_por_id(
            funcionario_id,
            empresa_id
        )

        return jsonify({
            "id": funcionario.id,
            "empresa_id": funcionario.empresa_id,
            "nome": funcionario.nome,
            "cargo": funcionario.cargo,
            "endereco": funcionario.endereco,
            "telefone": funcionario.telefone,
            "valor_salario": str(funcionario.valor_salario)
            if funcionario.valor_salario is not None else None,
            "data_admissao": funcionario.data_admissao.isoformat()
            if funcionario.data_admissao else None,
            "data_demissao": funcionario.data_demissao.isoformat()
            if funcionario.data_demissao else None,
            "status": funcionario.status
        }), 200

    except Exception as e:

        return jsonify({
            "erro": str(e)
        }), 500


@funcionario_bp.route("/<int:funcionario_id>", methods=["PUT"])
@jwt_required()
def atualizar(funcionario_id):

    try:

        dados = request.get_json()

        claims = get_jwt()

        empresa_id = claims.get("empresa_id")

        funcionario = FuncionarioService.atualizar(
            funcionario_id,
            dados,
            empresa_id
        )

        return jsonify({
            "mensagem": "Funcionário atualizado com sucesso",
            "funcionario": {
                "id": funcionario.id,
                "nome": funcionario.nome,
                "cargo": funcionario.cargo,
                "endereco": funcionario.endereco,
                "telefone": funcionario.telefone,
                "valor_salario": str(funcionario.valor_salario)
                if funcionario.valor_salario is not None else None,
                "data_admissao": funcionario.data_admissao.isoformat()
                if funcionario.data_admissao else None,
                "data_demissao": funcionario.data_demissao.isoformat()
                if funcionario.data_demissao else None,
                "status": funcionario.status
            }
        }), 200

    except Exception as e:

        return jsonify({
            "erro": str(e)
        }), 500


@funcionario_bp.route("/<int:funcionario_id>", methods=["DELETE"])
@jwt_required()
def excluir(funcionario_id):

    try:

        claims = get_jwt()

        empresa_id = claims.get("empresa_id")

        FuncionarioService.excluir(
            funcionario_id,
            empresa_id
        )

        return jsonify({
            "mensagem": "Funcionário excluído com sucesso"
        }), 200

    except Exception as e:

        return jsonify({
            "erro": str(e)
        }), 500