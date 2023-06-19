'use strict';
import * as net from 'net';
const heartbeat_port = process.env.HEARTBEAT_PORT ?? 8085;
const server_name = process.env.SERVER_NAME ?? 'localhost';

let client = null;

try{
  client = new net.Socket();
} catch (error) {
  console.log(error);
}


setTimeout(() => {
    const socket = client.connect(heartbeat_port, server_name, function() {
      console.log('Connected');
      client.write("Hello From Client " + client.address().address);
    });

    socket.on('close', err => console.log("Closed"));

    socket.on('error', err => console.log(err));
}, 1000);
