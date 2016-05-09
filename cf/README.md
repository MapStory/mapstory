# Create Postgresql and ElasticSearch services for cloudfoundry.

```
cf create-service elephantsql turtle mapstory-pgsql
cf create-service searchly starter mapstory-es
```

# Push project.

# use pip

```
cf push -f cf/mapstory_manifest.yml
```