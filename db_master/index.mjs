import {
  get_udp_socket,
  get_tcp_socket
} from './network/sockets.mjs';
import config from './config.mjs';

// Initialise server
const server_name = config.server_name;
const heartbeat_port = config.heartbeat_port;

const [udp, tcp] = [
  get_udp_socket(server_name, heartbeat_port),
  get_tcp_socket(server_name, heartbeat_port)
];

// Create a list of active connections
const active_servers = new Set();

// Register
tcp.on('connection', sock => {
  const IP = sock.remoteAddress;
  const PORT = sock.remotePort;
  const name = `${IP}:${PORT}`;

  console.log(`${name}: Connection established.`);

  // register a database
  sock.on('data', data => {
    if (data == "Connect me as database!") {
      active_servers.add(IP);
      sock.write('Registered as database node.');
      sock.destroy();
    } else {
      sock.write(`Invalid request parameter '${data}'.`);
    }
  });

  sock.on('close', _ => console.log(`Connection closed with ${name}\n`));
});


// Heartbeat
udp.on('data', (msg, rinfo) => {
  console.log(`UDP got: ${msg} from ${rinfo.address}:${rinfo.port}\n`);
});