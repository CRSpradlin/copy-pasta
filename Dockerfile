FROM node:12
WORKDIR /home/node/app
RUN set -eux; \
        apt update -y; \
        apt upgrade -y; 
CMD ["tail", "-f", "/dev/null"] 
