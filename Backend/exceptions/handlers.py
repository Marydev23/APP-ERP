from flask import jsonify
from exceptions.api_exception import ApiException


def register_error_handlers(app):

    @app.errorhandler(ApiException)
    def handle_api_exception(e):

        return jsonify({
            "erro": e.mensagem
        }), e.status_code


    @app.errorhandler(Exception)
    def handle_internal_error(e):
        import traceback

        traceback.print_exc()

        return jsonify({
            "erro": str(e)
        }), 500