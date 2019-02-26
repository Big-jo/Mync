const env = process.env.NODE_ENV;

const development = {
    app:{
        port:3000
    }
}

const production = {
    app:{
        port: process.env.PORT
    }
}

const config ={
    development,
    production
}
module.exports = config[env]