DCO=docker-compose
$DCO run pgadmin "--init-db"
$DCO run django "--init-db --reindex"
