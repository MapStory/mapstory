from django.contrib import admin

from mapstory.journal.models import JournalEntry


class JournalEntryAdmin(admin.ModelAdmin):
    model = JournalEntry
    list_display = 'title', 'author', 'publish', 'date'
    list_editable = 'publish',


admin.site.register(JournalEntry, JournalEntryAdmin)
