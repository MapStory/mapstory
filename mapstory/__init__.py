__version__ = (2, 1, 1, 'rc', 2)


def get_version():
    import mapstory.version
    return mapstory.version.get_version(__version__)
