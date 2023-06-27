import {
  get_udp_socket,
  get_tcp_socket
} from './network/sockets';
import * as config from './config';

// Initialise server
const server_name = config.server_name;
const heartbeat_port = config.heartbeat_port;

const tcp = get_tcp_socket(server_name, heartbeat_port);

// Create a list of active connections
const active_servers = new Set();

// Register TCP Events
tcp.onNewConnection((IP, PORT) => console.log(`${IP}:${PORT} - Connection established`));

tcp.onMessage((IP, PORT, data) => {
  if (data == "Connect me as database!") {
    active_servers.add(IP);
    tcp.send(IP, PORT, 'Registered as database node.');
    tcp.closeConnection(IP, PORT);
    return;
  }

  tcp.send(IP, PORT, `Invalid request parameter '${data}'.`);
});

tcp.onConnectionClose((IP, PORT) => console.log(`Connection closed with ${IP}:${PORT}\n`));