export const heartbeat_port: number = parseInt(process.env.HEARTBEAT_PORT ?? '8081');
export const server_name: string = process.env.SERVER_NAME ?? 'localhost';
export const interval_time: number = parseInt(process.env.INTERVAL_TIME ?? '5000');
export const chance_limit: number = parseInt(process.env.CHANCE_LIMIT ?? '10');