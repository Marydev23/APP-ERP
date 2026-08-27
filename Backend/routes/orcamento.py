from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt

from services.orcamento_service import OrcamentoService


orcamento_bp = Blueprint(
    "orcamento",
    __name__
)


def orcamento_to_dict(orcamento):

    return {
        "id": orcamento.id,
        "empresa_id": orcamento.empresa_id,
        "cliente_id": orcamento.cliente_id,

        "frete": (
            str(orcamento.frete)
            if orcamento.frete is not None
            else "0.00"
        ),

        "desconto": (
            str(orcamento.desconto)
            if orcamento.desconto is not None
            else "0.00"
        ),

        "subtotal": (
            str(orcamento.subtotal)
            if orcamento.subtotal is not None
            else "0.00"
        ),

        "total": (
            str(orcamento.total)
            if orcamento.total is not None
            else "0.00"
        ),

        "status": orcamento.status,

        "observacao": orcamento.observacao,

        "criado_em": (
            orcamento.criado_em.isoformat()
            if orcamento.criado_em
            else None
        ),

        "atualizado_em": (
            orcamento.atualizado_em.isoformat()
            if orcamento.atualizado_em
            else None
        )
    }


# ==========================================================
# CADASTRAR ORÇAMENTO
# ==========================================================

@orcamento_bp.route("/", methods=["POST"])
@jwt_required()
def registrar():

    dados = request.get_json()

    claims = get_jwt()

    empresa_id = claims.get("empresa_id")

    orcamento = OrcamentoService.registrar(
        dados,
        empresa_id
    )

    return jsonify({
        "mensagem": "Orçamento cadastrado com sucesso",
        "orcamento": orcamento_to_dict(orcamento)
    }), 201


# ==========================================================
# LISTAR ORÇAMENTOS
# ==========================================================

@orcamento_bp.route("/", methods=["GET"])
@jwt_required()
def listar():

    claims = get_jwt()

    empresa_id = claims.get("empresa_id")

    orcamentos = OrcamentoService.listar(
        empresa_id
    )

    return jsonify([
        orcamento_to_dict(orcamento)
        for orcamento in orcamentos
    ]), 200


# ==========================================================
# BUSCAR ORÇAMENTO POR ID
# ==========================================================

@orcamento_bp.route("/<int:orcamento_id>", methods=["GET"])
@jwt_required()
def buscar(orcamento_id):

    claims = get_jwt()

    empresa_id = claims.get("empresa_id")

    orcamento = OrcamentoService.buscar_por_id(
        orcamento_id,
        empresa_id
    )

    return jsonify(
        orcamento_to_dict(orcamento)
    ), 200


# ==========================================================
# ATUALIZAR ORÇAMENTO
# ==========================================================

@orcamento_bp.route("/<int:orcamento_id>", methods=["PUT"])
@jwt_required()
def atualizar(orcamento_id):

    dados = request.get_json()

    claims = get_jwt()

    empresa_id = claims.get("empresa_id")

    orcamento = OrcamentoService.atualizar(
        orcamento_id,
        dados,
        empresa_id
    )

    return jsonify({
        "mensagem": "Orçamento atualizado com sucesso",
        "orcamento": orcamento_to_dict(orcamento)
    }), 200


# ==========================================================
# RECALCULAR ORÇAMENTO
# ==========================================================

@orcamento_bp.route(
    "/<int:orcamento_id>/recalcular",
    methods=["PUT"]
)
@jwt_required()
def recalcular(orcamento_id):

    claims = get_jwt()

    empresa_id = claims.get("empresa_id")

    orcamento = OrcamentoService.recalcular(
        orcamento_id,
        empresa_id
    )

    return jsonify({
        "mensagem": "Orçamento recalculado com sucesso",
        "orcamento": orcamento_to_dict(orcamento)
    }), 200


# ==========================================================
# EXCLUIR ORÇAMENTO
# ==========================================================

@orcamento_bp.route(
    "/<int:orcamento_id>",
    methods=["DELETE"]
)
@jwt_required()
def excluir(orcamento_id):

    claims = get_jwt()

    empresa_id = claims.get("empresa_id")

    OrcamentoService.excluir(
        orcamento_id,
        empresa_id
    )

    return jsonify({
        "mensagem": "Orçamento excluído com sucesso"
    }), 200