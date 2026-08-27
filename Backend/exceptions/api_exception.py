class ApiException(Exception):
    def __init__(self, mensagem, status_code):
        self.mensagem = mensagem
        self.status_code = status_code

class BadRequest(ApiException):

    def __init__(self, mensagem):
        super().__init__(mensagem, 400)


class NotFound(ApiException):

        def __init__(self, mensagem):
            super().__init__(mensagem, 404)


class Unauthorized(ApiException):

        def __init__(self, mensagem):
            super().__init__(mensagem, 401)