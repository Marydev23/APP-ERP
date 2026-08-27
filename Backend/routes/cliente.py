from flask import Blueprint, request, jsonify

from services.cliente_service import ClienteService

from flask_jwt_extended import (
    jwt_required,
    get_jwt
)


cliente = Blueprint("cliente", __name__)


@cliente.route("/register", methods=["POST"])
@jwt_required()
def register():

    try:

        dados = request.get_json()

        claims = get_jwt()

        empresa_id = claims["empresa_id"]


        novo_cliente = ClienteService.registrar(
            dados,
            empresa_id
        )


        return jsonify({
            "mensagem": "Cliente cadastrado com sucesso.",
            "id": novo_cliente.id
        }), 201


    except ValueError as e:

        return jsonify({
            "erro": str(e)
        }), 400


    except Exception as e:

        return jsonify({
            "erro": "Erro interno ao cadastrar cliente.",
            "detalhes": str(e)
        }), 500

@cliente.route("/", methods=["GET"])
@jwt_required()
def listar():

    claims = get_jwt()
    empresa_id = claims["empresa_id"]

    clientes = ClienteService.listar(empresa_id)

    return jsonify([
        {
            "id": cliente.id,
            "nome": cliente.nome,
            "cpf_cnpj": cliente.cpf_cnpj,
            "telefone": cliente.telefone,
            "email": cliente.email,
            "cidade": cliente.cidade,
            "estado": cliente.estado
        }
        for cliente in clientes
    ]), 200


@cliente.route("/<int:id>", methods=["GET"])
@jwt_required()
def buscar_cliente(id):

    empresa_id = get_jwt()["empresa_id"]

    try:
        cliente = ClienteService.buscar_por_id(
            id,
            empresa_id
        )

        return jsonify({
            "id": cliente.id,
            "nome": cliente.nome,
            "cpf_cnpj": cliente.cpf_cnpj,
            "telefone": cliente.telefone,
            "email": cliente.email,
            "endereco": cliente.endereco,
            "cidade": cliente.cidade,
            "estado": cliente.estado,
            "cep": cliente.cep,
            "observacao": cliente.observacao
        }), 200

    except ValueError as e:

        return jsonify({
            "erro": str(e)
        }), 404
    
@cliente.route("/<int:id>", methods=["PUT"])
@jwt_required()
def atualizar(id):
    dados = request.get_json()
    empresa_id=get_jwt()["empresa_id"]
    cliente=ClienteService.atualizar(
        id,
        dados,
        empresa_id
    )

    return jsonify({
        "mensagem":"Cliente atualizado com sucesso",
        "id": cliente.id
    }),200

@cliente.route("/<int:id>", methods=["DELETE"])
@jwt_required()
def deletar(id):

    empresa_id = get_jwt()["empresa_id"]

    ClienteService.deletar(
        id,
        empresa_id
    )

    return jsonify({
        "mensagem": "Cliente removido com sucesso"
    }),200



    