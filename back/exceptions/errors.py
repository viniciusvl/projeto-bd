class AppException(Exception):

    status_code = 500

    def __init__(self, message="Erro interno do servidor"):
        self.message = message
        super().__init__(message)


class NotFound(AppException):

    status_code = 404

    def __init__(self, message="Recurso não encontrado"):
        super().__init__(message)


class BadRequest(AppException):

    status_code = 400

    def __init__(self, message="Requisição inválida"):
        super().__init__(message)
