exec {
  command = "nginx -g \"daemon off;\""
}

template {
  source = "/opt/templates/nginx.conf.ctmpl"
  destination = "/etc/nginx/nginx.conf"
  perms = 0644
}
