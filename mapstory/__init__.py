__version__ = (1, 0, 0, 'rc', 0)


def get_version():
    import mapstory.version
    return mapstory.version.get_version(__version__)