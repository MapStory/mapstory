from django.core.management.base import BaseCommand
from mapstory.mapstories.models import Map,MapStory
import re

class Command(BaseCommand):
    help = 'This command looks for Map objects that are missing a associated MapStory and creates/links the new model'

    def add_arguments(self, parser):
        parser.add_argument(
            '--dry-run',
            action='store_true',
            dest='dry-run',
            default=False,
            help='dont save changes to story objects and print more information about converted stories'
        )

    def handle(self, *args, **options):
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
                                     abstract=old_story.abstract)
                new_story_print = launder(new_story.title)
                if options['dry-run'] is False:
                    new_story.save()
                    new_story.set_default_permissions()
                else:
                    self.stdout.write('New Mapstory Object: {0}'.format(new_story_print))
                    self.stdout.write('Title: {0}'.format(new_story_print))

                # create the foreign key link to the new story and set it to the first chapter
                old_story.story = new_story
                old_story.chapter_index = 0
                if options['dry-run'] is False:
                    old_story.save()


                stories_updated += 1
                if options['dry-run'] is False:
                    self.stdout.write('Converted old mapstory: {0}'.format(new_story_print))
                else:
                    self.stdout.write('Converted old mapstory: {0}, but did not save'.format(new_story_print))

            self.stdout.write('{0} stories converted to new model'.format(stories_updated))

        else:
            self.stdout.write('No Chapters found without a Mapstory')
