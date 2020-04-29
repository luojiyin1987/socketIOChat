import { KoaContext } from "../../types/koa";

export  default  function isLogin() {
    const noRequireLoginEvent = new Set([
        'register',
        'login',
        'loginByToken',
        'guest',
        'getDefaultGroupHistoryMessages',
        'getDefaultGroupOnlineMembers',
        'getBaiduToken',
    ]);

    return async (ctx: KoaContext, next: Function)=> {
        if(!noRequireLoginEvent.has(ctx.event) && !ctx.socket.user) {
            ctx.res = '请登录后再试';
            return;
        }
        await  next();
    };
}
