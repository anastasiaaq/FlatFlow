from rest_framework.exceptions import APIException


class InviteCodeNotFoundError(APIException):
    status_code = 404
    default_detail = "Invite code not found"
    default_code = "invite_code_not_found"


class AlreadyInHouseholdError(APIException):
    status_code = 409
    default_detail = (
        "You are already a member of a household. Leave it first to join another"
    )
    default_code = "already_in_household"


class AlreadyInThisHouseholdError(APIException):
    status_code = 409
    default_detail = "You are already a member of this household"
    default_code = "already_in_this_household"


class CannotCreateWhileInHouseholdError(APIException):
    status_code = 409
    default_detail = (
        "You are already a member of a household. Leave it first to create a new one"
    )
    default_code = "cannot_create_while_in_household"


class NotInHouseholdError(APIException):
    status_code = 404
    default_detail = "You are not a member of any household"
    default_code = "not_in_household"
