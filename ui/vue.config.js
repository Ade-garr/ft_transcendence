// vue.config.js

const { debug } = require('console');

/**
 * @type {import('@vue/cli-service').ProjectOptions}
 */

module.exports = {
    devServer: {
        proxy: {
            '^/chat': {
                target: 'http://nestjs-api:3000/',
                ws: true,
                secure: false,
                logLevel: 'debug',
                changeOrigin: true,
            },
        },
        proxy: {
            '^/api': {
                target: 'http://nestjs-api:3000/',
                logLevel: 'debug',
                changeOrigin: true,
            },
        }
    }
}