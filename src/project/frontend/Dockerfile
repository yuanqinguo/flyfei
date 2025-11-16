FROM docker.cnb.cool/byboat/edu.boat.image_base:adminrun-1.0.0

ARG BUILD_ENV
ENV BUILD_ENV=${BUILD_ENV}

ADD . /data/build/
WORKDIR /data/build

RUN pnpm install

RUN pnpm run build --mode $BUILD_ENV

RUN mkdir -p /usr/local/openresty/nginx/html/web-cdn/admin

RUN cp -r dist/* /usr/local/openresty/nginx/html
RUN mv dist/* /usr/local/openresty/nginx/html/web-cdn/admin

RUN rm -rf /data/build
