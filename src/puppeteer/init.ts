import puppeteer, { Browser, Page } from "puppeteer";

export class CreatePuppeteer {

    browser?: Browser;
    pages: Page[] = [];
    currentPage?: Page;

    async init() {
        this.browser = await puppeteer.launch({
            headless: false,
            timeout: 0,
        });
        await this.createNewPage();
    }

    async createNewPage() {
        this.handleEmptyBrowser();
        const newPage = await this.browser?.newPage();
        if (newPage) {
            this.pages.push(newPage);
            this.currentPage = newPage;
        }
    }

    async openUrl(url: string) {
        this.handleEmptyCurrentPage();
        await this.currentPage?.goto(url);
        await new Promise(resolve => setTimeout(resolve, 10000));
    }

    async closeBrowser() {
        await this.browser?.close();
    }

    // interactions script

    async focusAndTypeOnElement(selector: string, value: string) {
        this.handleEmptyCurrentPage();
        await this.currentPage?.focus(selector);
        await this.currentPage?.keyboard.type(value);
    }

    async submitForm(selector: string) {
        this.handleEmptyCurrentPage();
        await Promise.all([
            await this.currentPage?.click(selector),
            await this.currentPage?.waitForNavigation({ waitUntil: "load" }),
        ])
    }

    async clickElement (selector: string) {
        this.handleEmptyCurrentPage();
        await this.currentPage?.click(selector);
    }

    async waitForElement (selector: string) {
        this.handleEmptyCurrentPage();
        await this.currentPage?.waitForSelector(selector);
    }

    handleEmptyBrowser() {
        if (!this.browser || !this.browser.connected) {
            throw new Error("Browser instance is empty");
        }
    }

    handleEmptyCurrentPage() {
        if (!this.currentPage) {
            throw new Error("Current Page is empty");
        }
    }

}