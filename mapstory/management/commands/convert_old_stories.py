from django.core.management.base import BaseCommand, CommandError
from geonode.maps.models import Map,MapStory
import re

class Command(BaseCommand):

    def handle(self, *args, **kwargs):
        # private function to launder story name in case it contains special characters
        def launder(string):

            return re.sub('[^0-9a-zA-Z]+', '_', string.lower())

        old_stories = Map.objects.filter(story__isnull=True)
        stories_updated = 0

        if old_stories.exists():

            for old_story in old_stories.iterator():

                # create the new story model object, populating it with data from old map in some cases.
                new_story = MapStory(owner=old_story.owner,
                                     title=old_story.title,
                                     name=launder(old_story.name),
                                     abstract=old_story.abstract)
                new_story.save()
                new_story.set_default_permissions()

                # create the foreign key link to the new story and set it to the first chapter
                old_story.story = new_story
                old_story.chapter_index = 0
                old_story.save()

                stories_updated += 1
                self.stdout.write('Converted old mapstory: {0}'.format(old_story.name))

            self.stdout.write('{0} stories converted to new model'.format(stories_updated))

        else:
            self.stdout.write('No Chapters found without a Mapstory')
