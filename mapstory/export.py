import csv

from django.http import HttpResponse


def export_via_model(model, request, queryset, fields=None, exclude=None):
    opts = model._meta
    field_names = set([field.name for field in opts.fields])
    if fields:
        fieldset = set(fields)
        field_names = field_names & fieldset
    elif exclude:
        excludeset = set(exclude)
        field_names = field_names - excludeset

    response = HttpResponse(content_type='text/csv')

    response['Content-Disposition'] = \
        'attachment; filename=%s.csv' % str(opts).replace('.', '_')

    field_names = list(field_names)
    writer = csv.DictWriter(response, field_names)
    writer.writer.writerow(field_names)

    for obj in queryset:
        writer.writerow(
            dict(
                list(zip(
                    field_names,
                    [str(getattr(obj, field)).encode("utf-8", "replace")
                     for field in field_names]
                ))
            )
        )
    return response
