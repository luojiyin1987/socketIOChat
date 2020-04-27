import path from 'path';
import options from '../utils/commandOptions';

const env = process.env;

function getFirstNotUndefined(...values: any[]) {
    for(let i=0; i< values.length; i++) {
        if(values[i] !== undefined) {
            return values[i];
        }
    }
    return null;
}

const now = new Date();
const frontendMonitorVersion = `${now.getFullYear()}-${now.getMonth()}-${now.getDate()} ${now.getHours()}:${now.getMinutes()}`;

export default  {
    commonn: {
        autoPrefix: {
            enable: true,
            options: {
                browers:['last 3 versions'],
            }
        }
    },
    build: {
        env: {
            NODE_ENV: '"production"',
            frontendMonitorAppId: JSON.stringify(options.frontendMonitorAppId),
            frontendMonitorVersion: JSON.stringify(frontendMonitorVersion),
        },
        index: path.resolve(__dirname, '../dist/index.html'),
        assetsRoot: path.resolve(__dirname, '../dist/fiora'),
        assetsPublicPath: getFirstNotUndefined(options.publicPath, env.PublicPath, '/'),
        productionSourceMap: false,
        productionGzip: false,
        productionGzipExtensions: ['js', 'css'],
        bundleAnalyzerReport: process.env.npm_config_report,
    },
    dev: {
        env: {
            NODE_ENV: '"development"',
        },
        host: 'localhost',
        port: 8080,
        autoOpenBrowser: false,
        assetsPublicPath: '/',
        cssSourceMap: false,
    },
};
