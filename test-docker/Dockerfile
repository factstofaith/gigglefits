FROM node:18-alpine
WORKDIR /app
RUN mkdir -p /app/test
COPY ./test.sh /app/test.sh
RUN chmod +x /app/test.sh
CMD ["sh", "/app/test.sh"]
