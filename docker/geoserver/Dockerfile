FROM tomcat:8-jre8
MAINTAINER Tyler Battle <tbattle@boundlessgeo.com>

ENV CONSUL_TEMPLATE_VERSION=0.18.1
ENV WEBAPPS_DIR=$CATALINA_HOME/webapps
ENV DOWNLOAD_URL=https://s3-us-west-2.amazonaws.com/mapstory-resources/geoserver/2.9/geoserver.war
ENV GEOSERVER_DATA_DIR /var/lib/geoserver/data

# Install tools
RUN set -ex \
    && apt-get update \
    && apt-get install -y --no-install-recommends \
        unzip \
    && rm -rf /var/lib/apt/lists/*

# Add CA cert for self signing
COPY ca.crt /usr/local/share/ca-certificates/
RUN set -ex \
    && update-ca-certificates \
    && keytool -import -v -trustcacerts -alias server-alias -file /usr/local/share/ca-certificates/ca.crt -keystore cacerts.jks -keypass changeit -storepass changeit -noprompt

# Install consul-template
RUN set -ex \
    && wget -qO /opt/consul-template.tgz https://releases.hashicorp.com/consul-template/$CONSUL_TEMPLATE_VERSION/consul-template_${CONSUL_TEMPLATE_VERSION}_linux_amd64.tgz \
    && tar xf /opt/consul-template.tgz -C /opt/ consul-template \
    && rm /opt/consul-template.tgz

# Install native dependencies
RUN set -ex \
    && apt-get update \
    && apt-get install -y --no-install-recommends \
        libgeos-dev \
        libproj-dev \
    && rm -rf /var/lib/apt/lists/*

# Install GeoServer WAR
RUN set -ex \
    && wget -qO $WEBAPPS_DIR/geoserver.war $DOWNLOAD_URL \
    && mkdir $WEBAPPS_DIR/geoserver \
    && unzip -qd $WEBAPPS_DIR/geoserver $WEBAPPS_DIR/geoserver.war \
    && rm $WEBAPPS_DIR/geoserver.war

RUN mkdir /tmp/mapstory && mkdir /tmp/mapstory/geoserver

COPY styles/ /tmp/styles
COPY config.hcl /opt/
COPY templates/ /opt/templates

COPY run.sh /opt/

#RUN mkdir -p $GEOSERVER_DATA_DIR && chown tomcat:tomcat $GEOSERVER_DATA_DIR
RUN mkdir -p $GEOSERVER_DATA_DIR
ENV GEOSERVER_ENABLE_GZIP true
CMD ["/opt/run.sh"]

#TODO: SECURITY don't run as root
