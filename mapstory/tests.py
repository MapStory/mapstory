from mapstory.models import Sponsor
from mapstory.models import get_sponsors


def make(model, **kwargs):
    i = model(**kwargs)
    return i.save() or i


def test_sponsor_ordering():
    make(Sponsor, name='a', order=1)
    make(Sponsor, name='b', order=0)
    make(Sponsor, name='c', order=-1)
    s = get_sponsors()
    assert s.count() is 2, 'expected 2 sponsors'
    assert s[0].order is 0 and s[0].name == 'b'
    assert s[1].order is 1 and s[1].name == 'a'
