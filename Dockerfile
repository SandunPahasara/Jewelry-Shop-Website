FROM nginxinc/nginx-unprivileged:stable-alpine

WORKDIR /usr/share/nginx/html

COPY index.html Homepage.html product.html checkout.html admin.html /usr/share/nginx/html/
COPY style.css admin.css checkout.css checkout.js /usr/share/nginx/html/
COPY components /usr/share/nginx/html/components
COPY images /usr/share/nginx/html/images
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 8080
