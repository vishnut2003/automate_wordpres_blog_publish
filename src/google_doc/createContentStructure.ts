import { JSDOM } from "jsdom"

export interface BlogContentDetails {
    title: string,
    content: string,
}

export async function createContentStructure(content: JSDOM) {
    return new Promise<BlogContentDetails>((resolve, reject) => {
        try {

            const title = content.window.document.querySelector("h1 > span")?.innerHTML;

            if (!title) {
                throw new Error("Please specify H1 in Google document for blog title.");
            }

            const document = content.window.document;

            const elements = document.querySelectorAll("h2, h3, h4, h5, h6, p");

            let blogContent = "";

            for (const element of elements) {
                blogContent += element.outerHTML + "\n";
            }

            return resolve({
                title,
                content: blogContent,
            });

        } catch (err) {
            return reject(err);
        }
    })
}