const fs = require("fs");
const request = require("request");
const got = require("got");
const jsdom = require("jsdom");
const readline = require("readline");
const { JSDOM } = jsdom;
const { EOL } = require("os");
const { exit } = require("process");
const { Builder, By, Key, until } = require('selenium-webdriver');

const url = "https://www.freelancer.com/u/";
const path = "./users/";

function downloadImage(url, filename) {
  try {
    request.head(url, function (err, res, body) {
      request(url).pipe(fs.createWriteStream(filename));
    });
  } catch (e) {
    //console.log(e);
  }
}

(async function example() {
  if (!fs.existsSync(path)) fs.mkdirSync(path);

  if (!fs.existsSync("ids.txt")) {
    console.log("ids.txt does not exist");
    exit(0);
  }

  const rs = fs.createReadStream("ids.txt");
  const comma = ",";
  let count = 1;

  const lineReader = readline.createInterface({
    input: rs,
  });
  
  for await (const line of lineReader) {
    let arr = line.split(comma);

    if (arr.length == 3) {
      let id = arr[0];
      let country = arr[1];
      let logo = arr[2];

      let userDir = path + country + " - " + id + "/";
      if (!fs.existsSync(userDir))
        fs.mkdirSync(userDir);
      else
        continue;

        let driver = await new Builder().forBrowser("chrome").build();
        try {
        const res = await got(url + id);
        const dom = new JSDOM(res.body);
        const document = dom.window.document;
        let name = document
        .querySelector(".NameContainer-name h3")
        .textContent.replace(/[^a-zA-Z& ]/g, "")
        .replace(/\s\s+/g, " ")
        .trim();
        if (logo) downloadImage(logo, userDir + name + ".jpg");
        /*Start getting portfolio with chromedriver */
        let portfoliosDir = userDir + "/portfolios/";
        if (!fs.existsSync(portfoliosDir))
          fs.mkdirSync(portfoliosDir);

          await driver.get(url+id);
    
          await driver.wait(async()=>{
            const portfolioDivs = await driver.findElements(By.className('PortfolioItemCard-file-image'));
            
            for(let i=0; i < portfolioDivs.length ; i++ ){

              const testConsole = await portfolioDivs[i].findElement(By.className('ImageElement'));
              const imageUrl = await testConsole.getAttribute('src');             
              if (imageUrl) downloadImage(imageUrl, portfoliosDir +"sample" +i.toString() + ".jpg");
            }
          },10000);
      } 
      catch (e) {
      }
      finally {
        await driver.quit();
      }
    }
  }
  
})();




