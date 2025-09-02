import axios from "axios";
import { handleCatchBlock } from "../functions/common"
import { createJSDOM } from "./createJSDOM";
import { BlogContentDetails, createContentStructure } from "./createContentStructure";

export async function fetchDocHtmlContent({ docUrl }: {
    docUrl: string,
}) {
    return new Promise<BlogContentDetails>(async (resolve, reject) => {
        try {

            if (!URL.canParse(docUrl)) {
                throw new Error("Doc URL provided in invalid!");
            }

            const urlObject = URL.parse(docUrl);
            const docId = urlObject?.pathname.split("/")[3];
            
            if (!docId) {
                throw new Error("Document id not found!");
            }

            const requestUrl = `https://docs.google.com/document/d/${docId}/export?format=html`;

            const {
                data: htmlContent,
            } = await axios.get<string>(requestUrl);

            const jsdom = await createJSDOM(htmlContent);

            const blogDetails = await createContentStructure(jsdom);

            return resolve(blogDetails);

        } catch (err) {
            const message = handleCatchBlock(err);
            return reject(message);
        }
    })
}