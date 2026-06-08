from rest_framework.exceptions import APIException


class ChoreNotFoundError(APIException):
    status_code = 404
    default_detail = "Chore not found"
    default_code = "chore_not_found"


class DutyCannotCompleteBeforeStartError(APIException):
    status_code = 400
    default_detail = "Duties can only be completed from their start date onward"
    default_code = "duty_cannot_complete_before_start"
