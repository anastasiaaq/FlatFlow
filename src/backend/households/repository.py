from .models import Household, Membership


class HouseholdRepository:
    def get_membership(self, user):
        return (
            Membership.objects.select_related("household")
            .filter(user=user)
            .first()
        )

    def get_by_invite_code(self, invite_code):
        return Household.objects.filter(invite_code=invite_code).first()

    def get_household_for_update(self, household_id):
        # Serialize concurrent leaves so the last-member check can't orphan the household.
        return Household.objects.select_for_update().get(pk=household_id)

    def invite_code_exists(self, invite_code):
        return Household.objects.filter(invite_code=invite_code).exists()

    def create_household(self, *, name, created_by, invite_code):
        return Household.objects.create(
            name=name,
            created_by=created_by,
            invite_code=invite_code,
        )

    def create_membership(self, *, user, household):
        return Membership.objects.create(user=user, household=household)

    def count_members(self, household):
        return household.memberships.count()

    def list_members(self, household):
        return [
            membership.user
            for membership in household.memberships.select_related("user")
        ]

    def unassign_member_chores(self, *, household, user):
        # assignee SET_NULL only fires on user deletion, not on leave, so clear it here.
        # US-3.2: active chores only; completed keep their assignee.
        from chores.models import Chore, ChoreStatus

        return Chore.objects.filter(
            household=household,
            assignee=user,
            status=ChoreStatus.ACTIVE,
        ).update(assignee=None)

    def delete_membership(self, membership):
        membership.delete()

    def delete_household(self, household):
        household.delete()
