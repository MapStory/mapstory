FROM fenglc/pgadmin4:1.4
LABEL maintainer="Tyler Battle <tbattle@boundlessgeo.com>"

ENV PACKAGES "postgresql-client"
ENV SCRIPTS /scripts

# Install additional packages
RUN apk add --update $PACKAGES && rm -rf /var/cache/apk/*

COPY scripts/ $SCRIPTS
COPY run.sh /

#TODO: SECURITY Don't run as root.

RUN adduser -D -g '' pgadmin
USER pgadmin

ENTRYPOINT ["/run.sh"]
CMD ["--init-db", "--serve"]
