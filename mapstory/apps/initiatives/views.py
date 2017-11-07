from django.shortcuts import render, get_object_or_404, redirect

from . import models


def initiatives_list(request):
    initiatives = models.Initiative.objects.all()
    return render(request, 'initiatives/list.html', context={
        'initiatives': initiatives
    })


def initiative_detail(request, slug):
    ini = get_object_or_404(models.Initiative, slug=slug)

    return render(request, 'initiatives/detail.html', context={
        'ini': ini,
    })
