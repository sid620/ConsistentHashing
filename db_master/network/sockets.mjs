'use strict';
import dgram from 'node:dgram';
import * as net from 'net';

export function get_udp_socket(server_name, port) {
    // create socket
    const udp_socket = dgram.createSocket('udp4');
    
    // event listener in case of error
    udp_socket.on("error", error => {
      udp_socket.close();
      console.log(`UDP Server Error: ${error.message}`);
      throw error;
    });
  
    // start udp server
  
    udp_socket.bind(port, server_name, () => {
      const address = udp_socket.address();
      console.log(`Heartbeat UDP Process started on ${address.address}:${address.port}`);
    });
  
    return udp_socket;
}
  
export function get_tcp_socket(server_name, port) {
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