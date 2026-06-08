from rest_framework.exceptions import APIException


class RuleNotFoundError(APIException):
    status_code = 404
    default_detail = "Rule not found"
    default_code = "rule_not_found"
