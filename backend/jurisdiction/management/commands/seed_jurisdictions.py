from django.core.management.base import BaseCommand
from jurisdiction.models import State, Division, District

class Command(BaseCommand):
    help = 'Seeds initial jurisdiction data for Uttar Pradesh'

    def handle(self, *args, **kwargs):
        state, created = State.objects.get_or_create(
            code="UP",
            defaults={"name": "Uttar Pradesh", "official_language": "hi"}
        )
        if created:
            self.stdout.write(self.style.SUCCESS(f'Created State: {state.name}'))

        division, created = Division.objects.get_or_create(
            state=state,
            code="LKO",
            defaults={"name": "Lucknow Division", "headquarters_city": "Lucknow"}
        )
        if created:
            self.stdout.write(self.style.SUCCESS(f'Created Division: {division.name}'))

        district, created = District.objects.get_or_create(
            division=division,
            code="LKO_DIST",
            defaults={"name": "Lucknow District", "pin_codes": ["226001", "226002", "226010"]}
        )
        if created:
            self.stdout.write(self.style.SUCCESS(f'Created District: {district.name}'))

        self.stdout.write(self.style.SUCCESS('Successfully seeded jurisdiction data.'))
