from django.shortcuts import render
from django.http import HttpResponse

# Create your views here.
#TODO:(Zunware)Create views for Organizations

#TODO: Organizations Home
#TODO: Organizations Details
def organization_detail(request):
    return render(request, 'organizations/organization_detail.html', {
        'foo': 'bar',
    })
