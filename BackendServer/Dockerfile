FROM ubuntu

RUN apt-get update
RUN apt-get install g++ -y
EXPOSE 8080

WORKDIR /app/
COPY ./heartbeat_server.cpp .

RUN g++ -o heartbeat_server.o heartbeat_server.cpp
RUN rm heartbeat_server.cpp

ENTRYPOINT ./heartbeat_server.o $SERVER_HEARTBEAT_PORT