import {
  get_tcp_socket, get_udp_socket
} from './network/sockets';
import * as config from './config';

// Initialise server
const server_name = config.server_name;
const heartbeat_port = config.heartbeat_port;

const tcp = get_tcp_socket(server_name, heartbeat_port);
const udp = get_udp_socket(server_name, heartbeat_port);

// maintain a map of active servers and their chances i.e IP -> chance
const active_servers = new Map<string, number>();

// Register TCP Events
tcp.onNewConnection((IP, PORT) => console.log(`${IP}:${PORT} - Connection established`));

tcp.onMessage((IP, PORT, data) => {
  if (data == "Connect me as database!") {
    active_servers.set(IP, 10);
    tcp.send(IP, PORT, 'Registered as database node.');
    tcp.closeConnection(IP, PORT);
    return;
  }

  tcp.send(IP, PORT, `Invalid request parameter '${data}'.`);
});

tcp.onConnectionClose((IP, PORT) => console.log(`Connection closed with ${IP}:${PORT}\n`));

// send heartbeat to all active servers every 5 seconds
setInterval(() => {
  console.log(`Active servers: ${active_servers.size}`);
  active_servers.forEach((chances, IP) => {
    if(chances <= 0) {
      active_servers.delete(IP);
      console.log(`Server ${IP} is no longer active. Deleting from active servers.`);
      return;
    } else {
      console.log(`Sending heartbeat to ${IP}.`);
      udp.send(IP, heartbeat_port, 'Heartbeat');
      active_servers.set(IP, chances - 1);
      console.log(`Heartbeat sent to ${IP}. Chances remaining: ${chances}`);
    }
 });
}, 5000);

// heartbeat response handler
udp.onMessage((IP, PORT, message) => {
  console.log(`Heartbeat response from ${IP}:${PORT} with message: ${message}`);
  if(message == "Heartbeat") {
    active_servers.set(IP, 10);
  }
});