import winston from "winston";

const logger=winston.createLogger({
    level:'info',
    format:winston.format.combine(
        winston.format.timestamp(),
        winston.format.simple()
    ),
    transports:[
        new winston.transports.Console(),
        new winston.transport.defaultMaxListeners({filename:'logs/app.logs'})
    ]
})

export default logger;