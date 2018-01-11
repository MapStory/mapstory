-- If extensions already exist, try updating them
ALTER EXTENSION postgis UPDATE;
ALTER EXTENSION postgis_topology UPDATE;

-- Try to create extensions
CREATE EXTENSION postgis;
CREATE EXTENSION postgis_topology;
