import type {Context} from "../lib/index.js"

/**
 * A global context variable for configuring libraries and applications.
 *
 * In your application, you'll want to add something like the following to your types.d.ts:
 * type MyContext = {
 *   x: number
 * }
 *
 * declare module "../lib/index.js" {
 *   interface Context {
 *     net: MyContext
 *   }
 * }
 */
export const ctx: any = {}

/**
 * Adds data to ctx.
 */
export const setContext = (newCtx: Context) => Object.assign(ctx, newCtx)
