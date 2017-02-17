from modeltranslation.translator import translator
from mapstory.mapstories.models import MapStory

translator.register(MapStory)
