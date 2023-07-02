export const heartbeat_port: number = parseInt(process.env.DBM_HEARTBEAT_PORT ?? '8081');
export const self_name: string = process.env.DBM_NAME ?? 'localhost';
export const heartbeat_interval_ms: number = parseInt(process.env.HEARTBEAT_INTERVAL_MS ?? '1000');
export const max_heartbeat_count: number = parseInt(process.env.MAX_HEARTBEAT_COUNT ?? '10');