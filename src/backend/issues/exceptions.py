from rest_framework.exceptions import APIException


class IssueNotFoundError(APIException):
    status_code = 404
    default_detail = "Issue not found"
    default_code = "issue_not_found"


class NotIssueAuthorError(APIException):
    status_code = 403
    default_detail = "Only the issue author can edit or delete this issue"
    default_code = "not_issue_author"
