import { handleCatchBlock } from "../functions/common"
import { JSDOM, VirtualConsole } from "jsdom"

export async function createJSDOM(content: string) {
    return new Promise<JSDOM>((resolve, reject) => {
        try {

            const vc = new VirtualConsole();
            const dom = new JSDOM(content, { virtualConsole: vc });
            return resolve(dom);

        } catch (err) {
            const message = handleCatchBlock(err);
            return reject(message);
        }
    })
}