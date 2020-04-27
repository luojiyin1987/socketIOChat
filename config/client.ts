const MB = 1024 * 1024;

export default  {
    server: process.env.NODE_ENV === 'development' ? '//localhost:9200' : '',
    maxImageSize: MB * 3,
    maxBackgroundImageSize: MB * 5,
    maxAvatarSize: MB * 1.5,

    theme: {
        default: {
            primaryColor: '74, 74, 226',
            primaryTextColor: '247, 247, 247',
            backgroundImage: require('../client/assets/images/background.jpg'),
            aero: false,
        },
        cool: {
            primaryColor: '5,159,149',
            primaryTextColor: '255, 255, 255',
            backgroundImage: require('../client/assets/images/background-cool.jpg'),
            aero: false,
        },
    },
    sound: 'default',
    tagColorMode: 'fixedColor',

    frontendMonitorAppId: process.env.frontendMonitorAppId || '',
}
