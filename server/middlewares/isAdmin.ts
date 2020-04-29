import config from '../../config/server';
import {KoaContext} from "../../types/koa";

export  default  function isAdmin() {
    const requireAdminEvent = new Set( [
        'sealUser',
        'getSealList',
        'resetUserPassword',
        'setUserTag',
        'deleteMessage',
        'getUserIps',
        'sealIp',
        'getSeatIpList',
    ]);
    return async (ctx: KoaContext, next: Function) => {
        if(requireAdminEvent.has(ctx.event)
           && ctx.socket.user.toString() !== config.administrator
        ) {

        }
    }
}
