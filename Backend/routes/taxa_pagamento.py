
from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt

from services.taxa_pagamento_service import TaxaPagamentoService


taxa_pagamento_bp = Blueprint(
    "taxa_pagamento",
    __name__,
    url_prefix="/taxa-pagamento"
)



@taxa_pagamento_bp.route("/", methods=["POST"])
@jwt_required()
def registrar():
    dados = request.get_json()

    claims = get_jwt()
    empresa_id = claims.get("empresa_id")

    taxa = TaxaPagamentoService.registrar(
        dados,
        empresa_id
    )

    return jsonify({
        "mensagem": "Taxa de pagamento cadastrada com sucesso",
        "taxa": taxa
    }), 201


# ==========================================================
# LISTAR TAXAS
# ==========================================================

@taxa_pagamento_bp.route("/", methods=["GET"])
@jwt_required()
def listar():
    claims = get_jwt()
    empresa_id = claims.get("empresa_id")

    taxas = TaxaPagamentoService.listar(
        empresa_id
    )

    return jsonify(taxas), 200


# ==========================================================
# BUSCAR TAXA POR ID
# ==========================================================

@taxa_pagamento_bp.route("/<int:taxa_id>", methods=["GET"])
@jwt_required()
def buscar_por_id(taxa_id):
    claims = get_jwt()
    empresa_id = claims.get("empresa_id")

    taxa = TaxaPagamentoService.buscar_por_id(
        taxa_id,
        empresa_id
    )

    return jsonify(taxa), 200


# ==========================================================
# ATUALIZAR TAXA
# ==========================================================

@taxa_pagamento_bp.route("/<int:taxa_id>", methods=["PUT"])
@jwt_required()
def atualizar(taxa_id):
    dados = request.get_json()

    claims = get_jwt()
    empresa_id = claims.get("empresa_id")

    taxa = TaxaPagamentoService.atualizar(
        taxa_id,
        dados,
        empresa_id
    )

    return jsonify({
        "mensagem": "Taxa de pagamento atualizada com sucesso",
        "taxa": taxa
    }), 200


# ==========================================================
# EXCLUIR TAXA
# ==========================================================

@taxa_pagamento_bp.route("/<int:taxa_id>", methods=["DELETE"])
@jwt_required()
def excluir(taxa_id):
    claims = get_jwt()
    empresa_id = claims.get("empresa_id")

    TaxaPagamentoService.excluir(
        taxa_id,
        empresa_id
    )

    return jsonify({
        "mensagem": "Taxa de pagamento excluída com sucesso"
    }), 200