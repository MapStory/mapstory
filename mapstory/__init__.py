__version__ = (2, 1, 0, 'rc', 0)


def get_version():
    import mapstory.version
    return mapstory.version.get_version(__version__)
