'use strict';
import * as net from 'net';
const heartbeat_port = process.env.HEARTBEAT_PORT ?? 8085;
const server_name = process.env.SERVER_NAME ?? 'localhost';

let client = new net.Socket();
const socket = client.connect(heartbeat_port, server_name, function() {
  client.write("Connect me as database!");
});

socket.on('data', data => console.log(`Server Response : ${data}`));

socket.on('close', err => console.log("Closed\n"));

socket.on('error', err => console.log(err));