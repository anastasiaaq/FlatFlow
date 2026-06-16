from .models import Chore


class ChoreRepository:
    def list_household_chores(self, household):
        return (
            Chore.objects.select_related(
                "assignee",
                "completed_by",
                "created_by",
            )
            .filter(household=household)
            .order_by("id")
        )

    def get_household_chore(self, *, household, chore_id):
        return (
            Chore.objects.select_related(
                "assignee",
                "completed_by",
                "created_by",
            )
            .filter(household=household, id=chore_id)
            .first()
        )

    def get_household_chore_for_update(self, *, household, chore_id):
        return (
            Chore.objects.select_for_update(of=("self",))
            .select_related(
                "assignee",
                "completed_by",
                "created_by",
            )
            .filter(household=household, id=chore_id)
            .first()
        )

    def get_household_member(self, *, household, user_id):
        membership = (
            household.memberships.select_related("user")
            .filter(user_id=user_id)
            .first()
        )
        if membership is None:
            return None
        return membership.user

    def list_member_ids(self, household):
        return set(household.memberships.values_list("user_id", flat=True))

    def create_chore(self, **fields):
        return Chore.objects.create(**fields)

    def save_chore(self, chore, update_fields):
        fields = set(update_fields)
        fields.add("updated_at")
        chore.save(update_fields=list(fields))
        return chore

    def delete_chore(self, chore):
        chore.delete()
