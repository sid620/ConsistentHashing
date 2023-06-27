export const heartbeat_port: number = parseInt(process.env.HEARTBEAT_PORT ?? '8081');
export const server_name: string = process.env.SERVER_NAME ?? 'localhost';