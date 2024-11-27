# Use a imagem base do NGINX
FROM nginx:alpine

# Instalação do editor vi, curl, Filebeat, Packetbeat e atualização do sistema
RUN apk update && \
    apk add --no-cache curl gnupg vim && \
    curl -L https://artifacts.elastic.co/GPG-KEY-elasticsearch | gpg --dearmor -o /usr/share/keyrings/elastic-archive-keyring.gpg && \
    echo "deb [signed-by=/usr/share/keyrings/elastic-archive-keyring.gpg] https://artifacts.elastic.co/packages/7.x/apt stable main" | tee /etc/apt/sources.list.d/elastic-7.x.list && \
    apk update && \
    apk add --no-cache filebeat packetbeat && \
    rm -f /etc/filebeat/filebeat.yml && \
    rm -rf /var/lib/apt/lists/*

# Copia os arquivos da aplicação para o diretório padrão do NGINX
COPY . /usr/share/nginx/html

# Copia a configuração personalizada do NGINX para o container
COPY nginx.conf /etc/nginx/nginx.conf

# Configuração do Filebeat para coletar logs do NGINX
COPY filebeat.yml /etc/filebeat/filebeat.yml

# Copia o script entrypoint para configurar serviços no início
COPY entrypoint.sh /usr/local/bin/entrypoint.sh

# Torna o script executável
RUN chmod +x /usr/local/bin/entrypoint.sh

# Exponha a porta 80 (porta padrão HTTP)
EXPOSE 80

# Comando para iniciar o Filebeat e o NGINX
ENTRYPOINT ["/usr/local/bin/entrypoint.sh"]
CMD ["nginx", "-g", "daemon off;"]
