import { JSDOM } from "jsdom"

export async function createContentStructure(content: JSDOM) {
    return new Promise<string>((resolve, reject) => {
        try {

            const title = content.window.document.querySelector("h1")?.innerHTML;

            if (!title) {
                throw new Error("Please specify H1 in Google document for blog title.");
            }

            const document = content.window.document;

            const elements = document.querySelectorAll("h2, h3, h4, h5, h6, p");

            for (const element of elements) {
                console.log(element.outerHTML, "\n");
            }

            return resolve("");

        } catch (err) {
            return reject(err);
        }
    })
}