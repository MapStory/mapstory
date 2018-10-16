import datetime

dateparts = '%Y', '%m', '%d'
timeparts = '%H', '%M', '%S'
_patterns = []
for i in xrange(len(dateparts)):
    _patterns.append('/'.join(dateparts[0:i + 1]))
    _patterns.append('-'.join(dateparts[0:i + 1]))
for i in xrange(len(timeparts)):
    time = ':'.join(timeparts[0:i + 1])
    _patterns.append('/'.join(dateparts) + 'T' + time)
    _patterns.append('-'.join(dateparts) + 'T' + time)
    _patterns.append('/'.join(dateparts) + ' ' + time)
    _patterns.append('-'.join(dateparts) + ' ' + time)
del dateparts, timeparts
_epoch = datetime.datetime.utcfromtimestamp(0)


def datetime_to_seconds(dt):
    delta = dt - _epoch
    # @todo replace with 2.7 call to total_seconds
    # return delta.total_seconds()
    return ((delta.days * 86400 + delta.seconds) * 10**6
            + delta.microseconds) / 1e6


def parse_date_time(val):
    if val is None:
        return None
    if val[0] == '-':
        raise ValueError('Alas, negative dates are not supported')
    idx = val.find('.')
    if idx > 0:
        val = val[:idx]
    for p in _patterns:
        try:
            return datetime.datetime.strptime(val, p)
        except ValueError:
            pass
