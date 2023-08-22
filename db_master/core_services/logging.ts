enum LogLevel {
    INFO,
    DEBUG,
    WARNING,
    ERROR
}

type LogLevelMapItem = [string, (msg: string) => void];

const logLevelMap: Record<LogLevel, LogLevelMapItem> = {
    [LogLevel.INFO]: ['info', info],
    [LogLevel.DEBUG]: ['debug', debug],
    [LogLevel.WARNING]: ['warning', warning],
    [LogLevel.ERROR]: ['error', error]
};

const logLevelArray: string[] = ['info', 'debug', 'warning', 'error'];

function log(level: LogLevel, message: string | string[]) {
    if (typeof message === 'string') {
        message = [message];
    }
    message.forEach(msg => {
        msg = `[${new Date().toDateString()} ${new Date().toTimeString()}] [${logLevelMap[level][0]}] ${msg}`;
        logLevelMap[level][1](msg);
    });
}

function info(message: string) {
    console.log(message);
}

function debug(message: string) {
    console.log(message);
}

function warning(message: string) {
    message = `${message}. Sending msg to admin.`;
    console.log(message);
}

function error(message: string) {
    message = `${message}. Sending msg to admin.`;
    console.log(message);
}
