#!/bin/bash
# Script de entrada (entrypoint) para inicialização do container

# # Ativa e configura os módulos do Filebeat
filebeat modules enable nginx
filebeat setup

# # Inicializa o Filebeat em segundo plano
filebeat -e &

# Iniciar o NGINX no foreground
nginx -g 'daemon off;'