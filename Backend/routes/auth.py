from flask import Blueprint, request, jsonify
from services.auth_service import AuthService

auth_bp = Blueprint("auth", __name__)


@auth_bp.route("/login", methods=["POST"])
def login():
    dados = request.get_json()

    try:
        token = AuthService.login(dados)

        return jsonify({
            "access_token": token
        }), 200

    except Exception as e:
        return jsonify({
            "erro": str(e)
        }), 400