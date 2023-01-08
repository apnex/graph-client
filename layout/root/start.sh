#!/bin/sh

## start nginx
/usr/sbin/nginx
tail -f /var/log/nginx/host.access.log
