FROM fenglc/pgadmin4:2.1-python2.7-alpine
LABEL maintainer="Tyler Battle <tbattle@boundlessgeo.com>"

ENV SCRIPTS /scripts

RUN apk add --no-cache \
        postgresql-client \
        su-exec \
        ;

COPY scripts/ $SCRIPTS
COPY run.sh /usr/local/bin/

RUN set -ex; \
    adduser -D -g '' pgadmin; \
    chown -R pgadmin:pgadmin /usr/local/lib/python2.7/site-packages/pgadmin4; \
    mkdir -p /var/log/pgadmin; \
    chown -R pgadmin:pgadmin /var/log/pgadmin;

ENTRYPOINT ["/usr/local/bin/run.sh"]
CMD ["--init-db", "--serve"]
