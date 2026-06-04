from rest_framework.exceptions import APIException


class UserAlreadyExistsError(APIException):
    status_code = 400
    default_detail = "An account with this email already exists"
    default_code = "user_already_exists"
