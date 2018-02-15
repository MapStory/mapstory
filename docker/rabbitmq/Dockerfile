FROM rabbitmq:3.6-management
LABEL maintainer="Tyler Battle <tbattle@boundlessgeo.com>"

# The run script loads env vars from Docker secrets
COPY run.sh /usr/local/bin/
ENTRYPOINT ["run.sh"]
CMD ["rabbitmq-server"]
