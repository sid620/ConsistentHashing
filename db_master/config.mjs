var config = {}

config.heartbeat_port = process.env.HEARTBEAT_PORT ?? 8081;
config.server_name = process.env.SERVER_NAME ?? 'localhost';

export default config;