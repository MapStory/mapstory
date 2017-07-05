FROM maven:3.5-jdk-8-alpine AS plugin-builder
MAINTAINER Tyler Battle <tbattle@boundlessgeo.com>

COPY m2 /root/.m2
COPY geoserver-geonode-ext /geoserver-geonode-ext
WORKDIR /geoserver-geonode-ext
RUN mvn dependency:go-offline
RUN mvn install -P boundless -DskipTests -Dmaven.gitcommitid.skip=true
