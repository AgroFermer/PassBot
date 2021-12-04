process.env.NTBA_FIX_319 = 1;

const TelegramBot = require('node-telegram-bot-api');

// replace the value below with the Telegram token you receive from @BotFather
const token = '2102671692:AAECCb8NilOiYIY4sK884GYUYAYGXVPkk1E';

const puppeteer = require('puppeteer');

// Create a bot that uses 'polling' to fetch new updates
const bot = new TelegramBot(token, {polling: true});

let user = new Object();

let start = async (chatId) => {

    await bot.on('text', async (msg) => {
        const chatId = msg.chat.id;
        const text = msg.text 
        if(text == '/start'){
     bot.sendSticker(chatId, 'https://tlgrm.ru/_/stickers/ea5/382/ea53826d-c192-376a-b766-e5abc535f1c9/7.webp')
     bot.sendMessage(chatId, 'Привіт! Я допоможу видалити твій гаманець Мастерпас. Для цього введи свій номер мобільного телефону без 380')
        }    
        });

    await bot.on('text', async (msg) => {
        const chatId = msg.chat.id;
        const text = msg.text 
        let numf = Number(text);
        if (text.length == 9 && isNaN(numf) == false){
            user.numTel = `${text}`
            console.log(user.numTel);
            console.log(numf);
            await bot.sendMessage(chatId, 'Будь ласка, очікуйте. Перевіряємо існування гаманця')
            const browser = await puppeteer.launch({executablePath: '/usr/bin/chromium-browser',
                                                    headless:true, 
                                                    args: [ '--ignore-certificate-errors', "--no-sandbox"]})

            const page = await browser.newPage();
            await page.goto('https://www.masterpass.com.ua/DeleteAccount.aspx');
            await page.click('#btnForgotPwd')
            await page.waitForSelector("#divDeleteAccount > label > a")
            await page.click("#divDeleteAccount > label > a")
            await page.waitForSelector("#msisdn1other")
            await page.type('#msisdn1other', user.numTel)
            await page.click("#btnSubmit")
            await page.waitForTimeout(6000)
            await page.waitForSelector("#lblErrorDelete" || "#btnOtpSubmit")
            await page.screenshot({ path: 'example.png' });
        
        
            const inf = await page.$eval("#lblErrorDelete", (el) => el.innerText ||"#otp-form > fieldset > div > p", (el) => el.innerText);
                console.log(inf);
        
                // await page.screenshot({ path: 'example.png' });
        
                if( inf == '#otp-form > fieldset > div > p') {
                    await bot.sendMessage(chatId, 'Введіть код з смс повідомлення. Час на ведення до 1 хвилини')
                    await bot.on('text', async (msg) => {
                        const chatId = msg.chat.id;
                        const text = msg.text
                        if (text.length === 6 && text != '/start'){
                            user.code = `${text}`
                            await bot.sendMessage(chatId, 'Очікуйте, опрацьовуємо видалення гаманця. Це може зайняти деякий час, до 3-х хвилин!')
                            await bot.sendSticker(chatId, 'https://tlgrm.ru/_/stickers/58b/c2b/58bc2bf6-b92f-384e-bf18-bb274dfb20be/1.webp')
                            console.log(user.code);
                        }
                    });
                    
                    await page.waitForTimeout(150000)
                    if (user.code != undefined){
                    await page.type('#otpValidationCode', user.code)
                        await page.click('#btnOtpSubmit')
                        await page.waitForTimeout(1200)
                        await page.waitForSelector('#lblError' || "#body > div.bootbox.modal.fade.bootbox-alert.in > div > div > div.modal-body > div")
        
                            const result = await page.$eval("#lblError", (el) => el.innerText || "#body > div.bootbox.modal.fade.bootbox-alert.in > div > div > div.modal-body > div", (el) => el.innerText);
                            
                        await page.waitForTimeout(3000)
                        await page.screenshot({ path: 'example.png' });
                        console.log(result);
                        if(result == '#body > div.bootbox.modal.fade.bootbox-alert.in > div > div > div.modal-body > div') {
                            await bot.sendMessage(chatId, 'Гаманець успішно видалено')
                            await bot.sendSticker(chatId, 'https://tlgrm.ru/_/stickers/dc7/a36/dc7a3659-1457-4506-9294-0d28f529bb0a/1.webp')
                        }
                        else {
                            await bot.sendMessage(chatId, 'Невірно введенно код або час на його введення вийшов')
                        }
                        await browser.close();
                    
                }
                else{
                    await bot.sendMessage(chatId, 'Ви ввели невірно код, або час на його введення вичерпано')
                }
                
        }
        else{
            await bot.sendMessage(chatId, 'Користувач або карта не може бути знайдений.')
            await page.screenshot({ path: 'example.png' });
            await browser.close(); 
  }
            
          }

          if(text != '/start' && isNaN(numf) == true) {
              await bot.sendMessage(chatId, 'Я тебе не розумію. Введи номер телефону без 380')
          }
        
    });
    
}

start();
