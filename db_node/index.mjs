'use strict';
import * as net from 'net';
const heartbeat_port = process.env.HEARTBEAT_PORT ?? 8081;

const client = new net.Socket();

setTimeout(() => client.connect(heartbeat_port, 'db_master', function() {
  console.log('Connected');
  client.write("Hello From Client " + client.address().address);
}), 1000);