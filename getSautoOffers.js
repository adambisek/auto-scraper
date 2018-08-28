const puppeteer = require('puppeteer');

const TASKS = [{
  name: 'Rapid a Octavia',
  url: 'https://www.sauto.cz/osobni/hledani#!category=1&condition=1&condition=2&condition=4&dph=1&first=1&priceMax=250000&servise=1&tachometrMax=75000&yearMax=2013&manufacturer=93&model=705&manufacturer=93&model=6445',
}, {
  name: 'Superb',
  url: 'https://www.sauto.cz/osobni/hledani#!category=1&condition=1&condition=2&condition=4&dph=1&first=1&priceMax=300000&tachometrMax=125000&yearMin=2012&manufacturer=93&model=708',
}]

const hasResultsNextPage = async (page) => {
  let nextPage = await page.evaluate((sel) => {
    const nextPage = document.querySelector('#nextPage')
    return nextPage ? nextPage.href : null
  }, '#nextPage');
  return nextPage;
}

const parseResults = async (page) => {
  let results = await page.evaluate((sel) => {
    const elements = Array.from(document.querySelectorAll(`#changingResults .result`));
    let links = elements.map(element => {
      return {
        creator: element.querySelector('dl dd:nth-child(8)') ? element.querySelector('dl dd:nth-child(8)').innerHTML : null,
        link: element.querySelector('a.toDetail') ? element.querySelector('a.toDetail').href : null,
      }
    })
    return links;
  }, '#changingResults');
  return results.filter(res => res.link) // odfiltruje reklamy, atd
}

const getResults = async () => {
  console.log('Sauto scraper starting up');
  const browser = await puppeteer.launch({
    headless: true,
  });
  const page = await browser.newPage();
  let allTasksResults = []

  for ({ url, name } of TASKS) {
    await page.goto(url);
    let results = []
    let run = true
    do {
      await page.waitFor(500);
      const pageResults = await parseResults(page);
      results = results.concat(pageResults);
      if (!await hasResultsNextPage(page)) {
        run = false;
        console.log('Searching... that was the last page');
      } else {
        console.log('Searching... going to the next page');
        await page.click('#nextPage');
      }
    }
    while (run);
  
    console.log(name);
    console.log('total results', results.length);
    allTasksResults = allTasksResults.concat(results)
  }

  console.log('Sauto scraper shutting down');
  await browser.close();
  return allTasksResults
}

module.exports = getResults
