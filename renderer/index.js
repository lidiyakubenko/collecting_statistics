const express = require('express')
const puppeteer = require('puppeteer');

const app = express()
const {ADDRESS, PORT} = process.env

console.log('ADDRESS', ADDRESS)
console.log('PORT', PORT)

app.get('*', async (req, res) => {
    console.log("got request!", req.url);

    let browser
    try {
        const args = ['--no-sandbox', '--disable-dev-shm-usage']
        browser = await puppeteer.launch({args});

        const page = await browser.newPage();
        await page.setDefaultNavigationTimeout(100000);
        await page.setRequestInterception(true);

        // отключить загрузку картинок и стилей
        page.on('request', req => {
            const r = req.resourceType()
            if (r === 'stylesheet' || r === 'font' || r === 'image') req.abort();
            else req.continue();
        });

        console.log('go to page')
        await page.goto(`${ADDRESS}${req.url}`);
        let bodyHTML = await page.evaluate(() => document.body.innerHTML);

        console.log('send html')
        res.send(bodyHTML)
    } catch (error) {
        console.log(error)
        res.send(error)
    } finally {
        if (browser) {
            await browser.close();
            console.log('browser closed')
        }
    }
})

app.listen(PORT, () => {
    console.log(`Example app listening at http://localhost:${PORT}`)
})