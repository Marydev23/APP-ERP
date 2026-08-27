from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt

from services.despesa_service import DespesaService


despesa_bp = Blueprint(
    "despesa",
    __name__
)


def despesa_to_dict(despesa):

    return {
        "id": despesa.id,
        "empresa_id": despesa.empresa_id,
        "categoria_id": despesa.categoria_id,
        "nome": despesa.nome,
        "descricao": despesa.descricao,

        "valor": (
            str(despesa.valor)
            if despesa.valor is not None
            else "0.00"
        ),

        "data_vencimento": (
            despesa.data_vencimento.isoformat()
            if despesa.data_vencimento
            else None
        ),

        "data_pagamento": (
            despesa.data_pagamento.isoformat()
            if despesa.data_pagamento
            else None
        ),

        "status": despesa.status,

        "criado_em": (
            despesa.criado_em.isoformat()
            if despesa.criado_em
            else None
        ),

        "atualizado_em": (
            despesa.atualizado_em.isoformat()
            if despesa.atualizado_em
            else None
        )
    }


# ==========================================================
# CADASTRAR DESPESA
# ==========================================================

@despesa_bp.route("/", methods=["POST"])
@jwt_required()
def registrar():

    dados = request.get_json()

    claims = get_jwt()

    empresa_id = claims.get("empresa_id")

    despesa = DespesaService.registrar(
        dados,
        empresa_id
    )

    return jsonify({
        "mensagem": "Despesa cadastrada com sucesso",
        "despesa": despesa_to_dict(despesa)
    }), 201


# ==========================================================
# LISTAR DESPESAS
# ==========================================================

@despesa_bp.route("/", methods=["GET"])
@jwt_required()
def listar():

    claims = get_jwt()

    empresa_id = claims.get("empresa_id")

    despesas = DespesaService.listar(
        empresa_id
    )

    return jsonify([
        despesa_to_dict(despesa)
        for despesa in despesas
    ]), 200


# ==========================================================
# BUSCAR DESPESA
# ==========================================================

@despesa_bp.route("/<int:despesa_id>", methods=["GET"])
@jwt_required()
def buscar(despesa_id):

    claims = get_jwt()

    empresa_id = claims.get("empresa_id")

    despesa = DespesaService.buscar_por_id(
        despesa_id,
        empresa_id
    )

    return jsonify(
        despesa_to_dict(despesa)
    ), 200


# ==========================================================
# ATUALIZAR DESPESA
# ==========================================================

@despesa_bp.route("/<int:despesa_id>", methods=["PUT"])
@jwt_required()
def atualizar(despesa_id):

    dados = request.get_json()

    claims = get_jwt()

    empresa_id = claims.get("empresa_id")

    despesa = DespesaService.atualizar(
        despesa_id,
        dados,
        empresa_id
    )

    return jsonify({
        "mensagem": "Despesa atualizada com sucesso",
        "despesa": despesa_to_dict(despesa)
    }), 200


# ==========================================================
# EXCLUIR DESPESA
# ==========================================================

@despesa_bp.route(
    "/<int:despesa_id>",
    methods=["DELETE"]
)
@jwt_required()
def excluir(despesa_id):

    claims = get_jwt()

    empresa_id = claims.get("empresa_id")

    DespesaService.excluir(
        despesa_id,
        empresa_id
    )

    return jsonify({
        "mensagem": "Despesa excluída com sucesso"
    }), 200