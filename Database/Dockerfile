FROM ubuntu

RUN apt-get update
RUN apt-get install g++ -y
# RUN apt-get install iputils-ping -y

WORKDIR /app/
COPY ./heartbeat_database.cpp .

RUN g++ -o heartbeat_database.o heartbeat_database.cpp
RUN rm heartbeat_database.cpp

ENTRYPOINT ./heartbeat_database.o $SERVER_NAME $SERVER_HEARTBEAT_PORT