import logging

import sys
import traceback

from geonode.geoserver.helpers import check_geoserver_is_up

from health_check.backends.base import (
    BaseHealthCheckBackend, ServiceReturnedUnexpectedResult, ServiceUnavailable
)

logger = logging.getLogger(__name__)


class GeoServerHealthCheck(BaseHealthCheckBackend):
    def check_status(self):
        try:
            check_geoserver_is_up()
            return True
        except AssertionError:
            logger.exception("Unknown Error")
            raise ServiceUnavailable("Unknown error")

# This must be registered when the app is setup
# plugin_dir.register(GeoServerHealthCheck)
