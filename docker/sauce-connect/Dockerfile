FROM bitnami/minideb:jessie AS downloader
LABEL maintainer="Tyler Battle <tbattle@boundlessgeo.com>"

ENV SC_VERSION 4.4.9

RUN install_packages \
        ca-certificates \
        wget

RUN wget https://saucelabs.com/downloads/sc-$SC_VERSION-linux.tar.gz -O - | tar -xz \
    && mv sc-$SC_VERSION-linux sc-linux


FROM bitnami/minideb:jessie AS runner
LABEL maintainer="Tyler Battle <tbattle@boundlessgeo.com>"

# Expects:
#     SAUCE_USERNAME
#     SAUCE_ACCESS_KEY

WORKDIR /usr/local/sauce-connect

RUN install_packages ca-certificates

COPY --from=downloader sc-linux/* ./

ENTRYPOINT ["./sc"]
CMD [""]
EXPOSE 4445
