
from flask import Blueprint, request, jsonify

from flask_jwt_extended import (
    jwt_required,
    get_jwt
)

from services.forma_pagamento_service import FormaPagamentoService


forma_pagamento_bp = Blueprint(
    "forma_pagamento",
    __name__
)


def forma_pagamento_to_dict(forma):

    return {

        "id": forma.id,

        "empresa_id": forma.empresa_id,

        "nome": forma.nome,

        "tipo": forma.tipo,

        "ativo": forma.ativo,

        "criado_em": (
            forma.criado_em.isoformat()
            if forma.criado_em
            else None
        ),

        "atualizado_em": (
            forma.atualizado_em.isoformat()
            if forma.atualizado_em
            else None
        )
    }


# ==========================================
# CADASTRAR
# ==========================================

@forma_pagamento_bp.route(
    "/",
    methods=["POST"]
)
@jwt_required()
def registrar():

    dados = request.get_json()

    claims = get_jwt()

    empresa_id = claims["empresa_id"]

    forma = FormaPagamentoService.registrar(
        dados,
        empresa_id
    )

    return jsonify({

        "mensagem":
            "Forma de pagamento cadastrada com sucesso.",

        "forma_pagamento":
            forma_pagamento_to_dict(forma)

    }), 201


# ==========================================
# LISTAR
# ==========================================

@forma_pagamento_bp.route(
    "/",
    methods=["GET"]
)
@jwt_required()
def listar():

    claims = get_jwt()

    empresa_id = claims["empresa_id"]

    formas = FormaPagamentoService.listar(
        empresa_id
    )

    return jsonify([

        forma_pagamento_to_dict(forma)

        for forma in formas

    ]), 200


# ==========================================
# BUSCAR
# ==========================================

@forma_pagamento_bp.route(
    "/<int:forma_id>",
    methods=["GET"]
)
@jwt_required()
def buscar(forma_id):

    claims = get_jwt()

    empresa_id = claims["empresa_id"]

    forma = FormaPagamentoService.buscar_por_id(
        forma_id,
        empresa_id
    )

    return jsonify(
        forma_pagamento_to_dict(forma)
    ), 200


# ==========================================
# ATUALIZAR
# ==========================================

@forma_pagamento_bp.route(
    "/<int:forma_id>",
    methods=["PUT"]
)
@jwt_required()
def atualizar(forma_id):

    dados = request.get_json()

    claims = get_jwt()

    empresa_id = claims["empresa_id"]

    forma = FormaPagamentoService.atualizar(
        forma_id,
        dados,
        empresa_id
    )

    return jsonify({

        "mensagem":
            "Forma de pagamento atualizada com sucesso.",

        "forma_pagamento":
            forma_pagamento_to_dict(forma)

    }), 200


# ==========================================
# EXCLUIR
# ==========================================

@forma_pagamento_bp.route(
    "/<int:forma_id>",
    methods=["DELETE"]
)
@jwt_required()
def excluir(forma_id):

    claims = get_jwt()

    empresa_id = claims["empresa_id"]

    FormaPagamentoService.excluir(
        forma_id,
        empresa_id
    )

    return jsonify({

        "mensagem":
            "Forma de pagamento excluída com sucesso."

    }), 200
