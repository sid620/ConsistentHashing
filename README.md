# ConsistentHashing
## Project Flow
First, we will implement heartbeat algorithm between server and database to keep track of which database are currently in the system.

Second, we will implement consistent hashing algorithm which will take care of data distribution in the databases. This stage doesn't include replication, we can only simulate addition of new databases in this step.

Lastly, we will have support for replication. Using replication, we can be sure that when a database node is down, we can redireibute data from replica to other nodes.

## Conditions of CAP Theorem
We will not make our system partition tolerant, as our target is to simulate the consistent hashing algorithm and we will simulate it on a local system. Availability and Consistency are the main concern of this project.

## Structure
### Container Types
There are two types of containers that we will use to simulate the consistent hashing of database. One will act as a backend server which takes requests from client and delegate them to appropriate database container. Second type of container is a database container, which will contain data. Database containers will implement consistent hashing, so they can join and leave the system.

### Networking
We will use the docker compose assigned network in our containers.

For the server, we will use two fixed ports and random ports:

1. `8080`: To connect to multiple clients.
2. `8081`: Port used by databases to register them for heartbeat.
3. OS assigned random port when server makes a connection with database on port `8082` after database register itself for heartbeat.

For the database, we will have one fixed port and random ports:

1. `8082`: This is the port on which our server will connect with the database.
2. OS assigned random port when database registers itself with server port `8081` for heartbeat.

For the client, we will expose port `8080` of server to port `8000` of the host. Thus, any device/application can talk to our database using the `8000` port on local host in (pubilc) network.

### IP resolution
Since there is only one backend server and multiple databases that can come and go out of system, we propose the following:

1. Server registers itself with the name `server` in the docker network. This will make an entry in network's DNS and we can directly find it in the code usig DNS query.
2. Set environment variable in Server's image for the port of database on which server will initiate the connection. Name of variable: `DATABASE_CONNECTION_PORT`.
3. Set the environment variable in Database's image for the port of server on which database needs to connect for heartbeat algorithm. Name of variable: `SERVER_HEARTBEAT_PORT`.

