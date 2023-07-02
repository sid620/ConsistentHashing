# ConsistentHashing
## What to expect
After completion of project, we will have a key-value store which is capable of horizontal scaling using consistent hashing algorithm. The `key` is supposed to be `string` and the `value` can be any valid JSON object. 

During initial phase, we work with `value` as `string`.

## Project Flow
First, we will implement heartbeat algorithm between server and database to keep track of which database are currently in the system.

Second, we will implement consistent hashing algorithm which will take care of data distribution in the databases. This stage doesn't include replication, we can only simulate addition of new databases in this step.

Lastly, we will have support for replication. Using replication, we can be sure that when a database node is down, we can redireibute data from replica to other nodes.

## Conditions of CAP Theorem
We will not make our system partition tolerant, as our target is to simulate the consistent hashing algorithm and we will simulate it on a local system. Availability and Consistency are the main concern of this project.

## Structure
### Container Types
There are three types of containers that we will use to simulate the consistent hashing of database.

- First type of container is a database node, which will contain data. Database containers will implement heartbeat algorithm, so they can join and leave the system and others can check their existence. These containers will be horizontally scaled.
- Second type will act as database master which will take the request and delegate it to apropriate database nodes. There is only one database master in the project, and we will see if it can be extended to support horizontal scaling.
- Third type will act as a backend server which takes requests from client and delegate them to database master. These act as a layer between client and database and have no memory of their own. So, they can be horizontally scaled easily.

### Port mappings
For database master,

- `8081`: The port which is used by for all heartbeat communications. This is set in `DBM_HEARTBEAT_PORT` environment variable.

For database nodes,

- `8081`: The port which will be used for heartbeat communications for specific node. This can be different for different nodes and is specified using `SELF_HEARTBEAT_PORT` environment variable.

### Environment Variables

For database master,

- `DBM_NAME` - This is the name of databse master. This is used by all devices in the network to get the IP address of database master from DNS. This is required in master too, because master will open ports on this specific IP address.
- `DBM_HEARTBEAT_PORT` - This is the number, which specifies the port for heartbeat communications from master (self).
- `HEARTBEAT_INTERVAL_MS` - Integer value specifying the interval between consecutive heartbeats to specific node in milliseconds.
- `MAX_HEARTBEAT_COUNT` - This specifies how many times we need to send heartbeat before declaring that the node is dead, if the node is not responding to heartbeats.

For database nodes,

- `DBM_NAME` - Same as environment variable of database master. Used by nodes to connect to this name for database registration.
- `DBM_HEARTBEAT_PORT` - Same as above. Specifies which port to connect to in database master.
- `SELF_HEARTBEAT_PORT` - This specifies the port which should be used for heartbeat communication for this specific node. This may or may not be different than server heartbeat port and the system makes no distinction.

## Communication
### Heartbeat

#### Node registration
Here are the steps to be followed by dabase node to register itself to database master:

1. Connect with database master on heartbeat port opened there via TCP. The TCP port on self can be anything.
2. Send the string `Connect me as database!-<PORT>` where `<PORT>` is the PORT on self which should be used for heartbeat communications from server.
3. Three of the following cases will happen:
   - Server sends `Invalid request parameter ..`, in which case client needs to send the appropriate message again. This occurs when the string sent doesn't match the format of string in step 2.
  - Server sends `Registered as database node.`. In this case, connection is successful and TCP connection is closed from server.
  - Any further attempts to register will simply fail and the TCP connection will be closed. Server will send the string `IP already registered`.

#### Heartbeat Communication

1. Server will send empty data to database node to the port specified in registration (via UDP).
2. If the node replies within the time limits (interval * time gap), then the system continues to work. The data sent by node is simply ignored by the server.
3. If the node doesn't reply in time, then the node is removed from the list of active nodes and no further requests will be sent to this IP address. Server will send a UDP packet with message `Removed as a database` to the target node. Reregistration will start from scratch if the node wants to reconnect and the state of data in node is assumed to be non existent.

## Running
Use the following command to make 5 instances of database nodes:

```
docker-compose up --build --scale db_node=5
```