from rest_framework.exceptions import APIException


class IssueNotFoundError(APIException):
    status_code = 404
    default_detail = "Issue not found"
    default_code = "issue_not_found"
