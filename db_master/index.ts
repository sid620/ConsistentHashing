import {
  get_tcp_socket, get_udp_socket
} from './network/sockets';
import * as config from './config';

// Initialise server
const self_name = config.self_name;
const self_heartbeat_port = config.heartbeat_port;
const heartbeat_interval_ms = config.heartbeat_interval_ms;
const max_heartbeat_count = config.max_heartbeat_count;

const tcp = get_tcp_socket(self_name, self_heartbeat_port);
const udp = get_udp_socket(self_name, self_heartbeat_port);

// Register logs
tcp.onMessage((IP, PORT, data) => console.log(`${IP}:${PORT} - Received '${data}'.`));
udp.onMessage((IP, PORT, data) => console.log(`${IP}:${PORT} - Received '${data}'.`));
tcp.onSend((IP, PORT, data) => console.log(`${IP}:${PORT} - Sent '${data}'.`));
udp.onSend((IP, PORT, data) => console.log(`${IP}:${PORT} - Sent '${data}'.`));

// maintain a map of active servers and their chances i.e IP -> chance
const active_servers = new Map<string, { chances: number, heartbeat_port: number}>();

// Register TCP Events
tcp.onNewConnection((IP, PORT) => console.log(`${IP}:${PORT} - Connection established`));

tcp.onMessage((IP, PORT, data) => {
  if (IP in active_servers) {
    tcp.send(IP, PORT, `IP already registered.`);
    tcp.closeConnection(IP, PORT);
  }

  const data_received = data.split('-');
  const request_string = data_received[0];
  const request_port = data_received.length > 1 ? Number(data_received[1]) : NaN;

  if (data_received.length !== 2 || 
      request_string != "Connect me as database!" || 
      !request_port) {
    tcp.send(IP, PORT, `Invalid request '${data}'.`);
    return;
  }

  active_servers.set(IP, {
    chances: max_heartbeat_count,
    heartbeat_port: request_port
  });

  tcp.send(IP, PORT, 'Registered as database node.');
  tcp.closeConnection(IP, PORT);
  return;
});

tcp.onConnectionClose((IP, PORT) => console.log(`Connection closed with ${IP}:${PORT}\n`));

// send heartbeat to all active servers by the amount specified in config
setInterval(() => {
  active_servers.forEach(({chances, heartbeat_port}, IP) => {
    if (chances == 0) {
      active_servers.delete(IP);
      console.log(`Server ${IP}:${heartbeat_port} is down. Removing from active servers.`);
      udp.send(IP, heartbeat_port, 'Removed as a database');
      return;
    }

    udp.send(IP, heartbeat_port, '');
    active_servers.get(IP).chances = chances - 1;
 });
}, heartbeat_interval_ms);

// heartbeat response handler
udp.onMessage((IP, PORT, message) => {
  if (!(IP in active_servers))
    return;

  if (message != "Heartbeat")
    return;
  
  const { chances } = active_servers.get(IP);

  if (chances < max_heartbeat_count - 1)
    console.log(`Server ${IP}:${PORT} responded to heartbeat after ${max_heartbeat_count - chances - 1} attempts.`);

  active_servers.get(IP).chances = max_heartbeat_count;
});