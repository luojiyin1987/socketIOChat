import {SealText, SealUserTimeout} from "./const";

let isSeal = false;

export default function fetch<T = any>(event: string, data = {}, {
    toast = true,
} = {}): Promise<[string | null, T | null]> {
    if (isSeal) {
        Message.error(SealText);
        return Promise.resolve([SealText, null]);
    }
    return new Promise((resolve) => {
        socket.emit(event, data, (res: any) => {
            if (typeof res === 'string') {
                if (toast) {
                    Message.error(res);
                }
                /**
                 * 服务端返回封禁状态后, 本地存储该状态
                 * 用户再触发接口请求时, 直接拒绝
                 */
                if (res === SealText) {
                    isSeal = true;
                    // 用户封禁和ip封禁时效不同, 这里用的短时间
                    setTimeout(() => { isSeal = false; }, SealUserTimeout);
                }
                resolve([res, null]);
            } else {
                resolve([null, res]);
            }
        });
    });
}
