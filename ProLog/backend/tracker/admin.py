from django.contrib import admin
from .models import Timer, Project, Experiment, Note, Image, Video

# Register your models here.
admin.site.register(Timer)
admin.site.register(Project)
admin.site.register(Experiment)
admin.site.register(Note)
admin.site.register(Image)
admin.site.register(Video)