const env = process.env.NODE_ENV;

const development = {
    app:{
        port:3000,
        timeOut: 11000
    }
}

const production = {
    app:{
        port: process.env.PORT,
        timeOut: 180000
    }
}

const config ={
    development,
    production
}
module.exports = config[env]