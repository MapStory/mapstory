__version__ = (2, 1, 2, 'rc', 1)


def get_version():
    import mapstory.version
    return mapstory.version.get_version(__version__)
