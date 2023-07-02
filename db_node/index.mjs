'use strict';
import * as net from 'net';
import dgram from 'node:dgram';

const master_heartbeat_port = process.env.DBM_HEARTBEAT_PORT ?? 8081;
const server_name = process.env.DBM_NAME ?? 'localhost';
const self_heartbeat_port = process.env.SELF_HEARTBEAT_PORT ?? 8086;

let client = new net.Socket();
const socket = client.connect(master_heartbeat_port, server_name, function() {
  client.write(`Connect me as database!-${self_heartbeat_port}`);
});

socket.on('data', data => console.log(`Server Response : ${data}`));

socket.on('close', err => console.log("Closed\n"));

socket.on('error', err => console.log(err));


// create socket
const udp_socket = dgram.createSocket('udp4');

// start udp server and bind it to the port
udp_socket.bind(self_heartbeat_port, () => {
  const address = udp_socket.address();
  console.log(`Heartbeat UDP Process started on ${address.address}:${address.port}`);
});
    
// event listener in case of error
udp_socket.on('error', err => {
  console.log(`UDP socket error:\n${err.stack}`);
  udp_socket.close();
});

// event listener for incoming messages
udp_socket.on('message', (msg, rinfo) => {
  udp_socket.send(msg, rinfo.port, rinfo.address);
});

