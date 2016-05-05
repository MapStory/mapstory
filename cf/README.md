# use pip

```
export LD_LIBRARY_PATH=/app/.heroku/python/lib/
export PATH=/bin:/usr/bin:/app/.heroku/python/bin
```

# if restart app changes in site packages will be lost
```
cf restart APP-NAME
```