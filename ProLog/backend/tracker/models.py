from django.db import models

# Create your models here.
class Project(models.Model):
    name = models.CharField(max_length=255)
    description = models.TextField()

    def __str__(self):
        return self.name

class Experiment(models.Model):
    project = models.ForeignKey(Project, on_delete=models.CASCADE, null=True, blank=True, related_name='experiments')
    title = models.CharField(max_length=200)
    description = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

class Timer(models.Model):
    experiment = models.ForeignKey(Experiment, null=True, blank=True, on_delete=models.CASCADE, related_name='timers')
    title = models.CharField(max_length=255)
    description = models.TextField(blank=True)
    start_time = models.DateTimeField(auto_now_add=True)
    end_time = models.DateTimeField(null=True, blank=True)

    def __str__(self):
        return f"{self.title} ({self.project.name})"

    def duration(self):
        if self.end_time:
            return self.end_time - self.start_time
        return None

class Note(models.Model):
    experiment = models.ForeignKey(Experiment, on_delete=models.CASCADE, null=True, blank=True, related_name='notes')
    title = models.CharField(max_length=255)
    content = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)

class Image(models.Model):
    experiment = models.ForeignKey(Experiment, null=True, blank=True,on_delete=models.CASCADE, related_name='images')
    image = models.ImageField(upload_to='project_images/')
    caption = models.CharField(max_length=255, blank=True)
    uploaded_at = models.DateTimeField(auto_now_add=True)

class Video(models.Model):
    experiment = models.ForeignKey(Experiment, on_delete=models.CASCADE, null=True, blank=True, related_name='videos')
    video = models.FileField(upload_to='project_videos/', blank=True, null=True)
    external_url = models.URLField(blank=True, null=True)
    caption = models.CharField(max_length=255, blank=True)
