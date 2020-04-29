import {existMemoryData, MemoryDataStorageKey} from "../memoryData";
import {KoaContext} from "../../types/koa";

const MaxCallPerMinutes = 20;
const newUserMaxCallPerMinutes = 5;

export default function frequency() {
    let callTimes: {[SocketId: string]: number} = {};

    setInterval(()=> {
        callTimes = {};
    }, 60000);

    return async (ctx: KoaContext, next: Function) => {
        const { user } = ctx.socket;

        if(user && user.toString() === '5adad39555703565e7903f79') {
            return next();
        }

        const socketId = ctx.socket.id;
        const count = callTimes[socketId] || 0;

        //新用户
        if( user
            && existMemoryData(MemoryDataStorageKey.NewUserList, user.toString())
            && count > newUserMaxCallPerMinutes)
        {
            ctx.res = '新用户 调用接口太过频繁';
            return null;
        }

        //普通用户
        if (count > MaxCallPerMinutes) {
            ctx.res = '普通用户 调用接口太过频繁';
            return null;
        }
        callTimes[socketId] = count +1;
        return next();
    }
}
