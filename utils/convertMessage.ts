function convertSystemMessage(message: any) {
    if(message.type === 'system') {
        message.from._id = 'system';
        message.from.originUsername = message.from.username;
        message.from.username = 'fake';
        message.from.avater = require('../client/assets/images/wuzeiniang.gif');
        message.from.tag = 'system';

        const content = JSON.parse(message.content);
        switch (content.command) {
            case 'roll' : {
                message.content = `掷出了${content.value}点 (上限${content.top}点)`;
                break;
            }
            case 'rps' : {
                message.content = `使出了 ${content.value}`;
                break;
            }

            default: {
                message.content =  '不支持的指令';
            }
        }
    }
}

export default function convertMessage(message: any) {
    convertSystemMessage(message);
}
