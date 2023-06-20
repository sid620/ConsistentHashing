'use strict';
import dgram from 'node:dgram';
import * as net from 'net';

const heartbeat_port = process.env.HEARTBEAT_PORT ?? 8081;
const server_name = process.env.SERVER_NAME ?? 'localhost';

function get_udp_socket(port) {
  // create socket
  const udp_socket = dgram.createSocket('udp4');
  
  // event listener in case of error
  udp_socket.on("error", error => {
    udp_socket.close();
    console.log(`UDP Server Error: ${error.message}`);
    throw error;
  });

  // start udp server
  udp_socket.on('listening', () => {
    const address = udp_socket.address();
    console.log(`Heartbeat UDP Process started on ${address.address}:${address.port}`);
  });
  
  udp_socket.bind(port);

  return udp_socket;
}

function get_tcp_socket(port) {
  // create socket
  const tcp_socket = net.createServer();

  // event listener in case of error
  tcp_socket.on("error", error => {
    tcp_socket.close();
    console.log(`TCP Server Error: ${error.message}`);
    throw error;
  });

  // start tcp server
  tcp_socket.listen(port, server_name, () => {
    const address = tcp_socket.address();
    console.log(`Heartbeat TCP Process started on ${address.address}:${address.port}`);
  });

  return tcp_socket;
}

let [udp, tcp] = [get_udp_socket(heartbeat_port), get_tcp_socket(heartbeat_port)];


udp.on('data', (msg, rinfo) => {
  console.log(`UDP got: ${msg} from ${rinfo.address}:${rinfo.port}`);
});

tcp.on('connection', sock => {
  console.log('TCP Connected: ' + sock.remoteAddress + ':' + sock.remotePort);

  sock.on('data', data => console.log(`Data received from ${sock.remoteAddress} : ${data}`));

  sock.on('close', _ => console.log('TCP Closed: ' + sock.remoteAddress + ' ' + sock.remotePort));
});
