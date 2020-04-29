import assert from 'assert';
import { KoaContext } from "../../types/koa";

export default  function catchError() {
    return async(ctx: KoaContext, next: Function) => {
        try {
            await  next();
        } catch (err) {
            if(err instanceof  assert.AssertionError) {
                ctx.res = err.message;
                return;
            }
            ctx.res = `Server Error: ${err.message}`;
            console.error('Unhandled Error\n', err);
        }
    }
}
