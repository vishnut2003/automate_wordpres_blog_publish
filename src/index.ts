import { selectOptionInput, textInput } from "./functions/inquirer";
import chalk from "chalk";
import ora from "ora";
import { CreatePuppeteer } from "./puppeteer/init";
import { handleCatchBlock, waitFor } from "./functions/common";
import { fetchDocHtmlContent } from "./google_doc";

const prebuildMessages = {

    captchaQuestion: {
        message: "Is your WordPress login page using any robot preveting algo?",
        choices: [
            {
                name: "Yes",
                value: "yes",
            },
            {
                name: "No",
                value: "no",
            }
        ]
    },
    wordpressLoginUrl: {
        message: "Please provide WordPress login URL:"
    },
    wordpressCredentials: {
        usernameMessage: "WordPress Username:",
        passwordMessage: "WordPress Password:",
    },
    documentAskQuestions: {
        message: "Please provide Blog Content Google document link: (link should be accessable by anyone.)",
    },
    finalConfirmation: {
        message: "Please confirm for publish.",
        options: [
            {
                name: "Confirm",
                value: "confirm",
            },
            {
                name: "Cancel",
                value: "cancel",
            }
        ]
    }
}

async function main() {

    while (true) {
        console.clear();
        console.log("\n")

        const isProtected = await selectOptionInput({
            message: prebuildMessages.captchaQuestion.message,
            choices: prebuildMessages.captchaQuestion.choices || [],
        })

        console.log("\n")

        if (isProtected === "yes") {
            const message = chalk.yellow("Please consider temporarily deactivating otherwise the upload will fail!");
            console.log(message, "\n");
        }


        let wordpressUrl = await textInput(prebuildMessages.wordpressLoginUrl.message);
        wordpressUrl = wordpressUrl.trim();

        if (!URL.canParse(wordpressUrl)) {
            console.log(
                "\n",
                chalk.red("Wordpress Login URL is invalid!"),
            );

            break;
        }

        console.log("\n")

        const username = await textInput(prebuildMessages.wordpressCredentials.usernameMessage)
        const password = await textInput(prebuildMessages.wordpressCredentials.passwordMessage)

        console.log("\n");

        const documentUrl = await textInput(prebuildMessages.documentAskQuestions.message)
        const blogDetails = await fetchDocHtmlContent({ docUrl: documentUrl });

        console.log(`Blog Title:\n ${blogDetails.title} \n`)
        console.log(`Blog Content:\n ${blogDetails.content}`);

        console.log("\n");

        const confirm = await selectOptionInput({
            message: prebuildMessages.finalConfirmation.message,
            choices: prebuildMessages.finalConfirmation.options,
        });

        if (confirm === "cancel") {
            break;
        }

        let spinner = ora("Login in to WordPress").start();

        const puppeteer = new CreatePuppeteer();
        await puppeteer.init()

        await puppeteer.openUrl(wordpressUrl);
        await puppeteer.focusAndTypeOnElement("#user_login", username)
        await puppeteer.focusAndTypeOnElement("#user_pass", password);

        await puppeteer.submitForm("#wp-submit");

        if (URL.canParse(puppeteer.currentPage?.url() || "")) {
            const url = URL.parse(puppeteer.currentPage?.url() || "");
            if (url?.pathname === "/wp-login.php") {
                spinner.fail("WordPress username or password is incorrect.");
                await puppeteer.closeBrowser();
                break;
            }
        }

        spinner.succeed("Wordpress Logged in Successfully!");

        spinner = ora("Publishing Blog...").start();

        const siteUrlObject = URL.parse(wordpressUrl) as URL;

        siteUrlObject.pathname = "/wp-admin/post-new.php";

        // Open Wordpress Add New Post Page
        await puppeteer.openUrl(siteUrlObject.href);

        await puppeteer.focusAndTypeOnElement("#title", blogDetails.title);
        await puppeteer.clickElement("#content-html");

        await puppeteer.waitForElement("#content");

        await puppeteer.focusAndTypeOnElement("#content", blogDetails.content);
        await puppeteer.clickElement("#content-tmce");

        await puppeteer.submitForm("#publish");

        await waitFor(10000)

        spinner.succeed("Blog published...");

        await puppeteer.closeBrowser();
        console.log("\n")
        const exit = await selectOptionInput({
            message: "Do you wish to exit or continue with another one?",
            choices: [
                {
                    name: "Exit",
                    value: "exit",
                },
                {
                    name: "Continue",
                    value: "continue",
                }
            ],
        });

        if (exit === "exit") {
            break;
        }

    }
}

(async () => {
    try {
        await main();
    } catch (err) {
        const message = handleCatchBlock(err);
        console.log(chalk.red(message));
    }
})()