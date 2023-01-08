FROM nginx:stable-alpine
EXPOSE 80
WORKDIR "/root"

COPY /layout /
COPY /client /var/www/html/

## entrypoint
ENTRYPOINT ["/root/start.sh"]
