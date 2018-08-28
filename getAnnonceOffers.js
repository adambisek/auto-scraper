const puppeteer = require('puppeteer');

const TASKS = [{
  name: 'Octavia',
  url: 'https://www.annonce.cz/osobni-vozy$18-filter.html?manufacturer=350&model=829&year_from=2+013&year_to=&cubature_from=&cubature_to=&load_from=&load_to=&fuel=&mileage_from=&mileage_to=75000&price_from=&price_to=250+000&location_country=&q=&crashed=0&maxAge=&nabidkovy=1&action=Hledej',
}, {
  name: 'Superb',
  url: 'https://www.annonce.cz/osobni-vozy$18-filter.html?manufacturer=350&model=832&year_from=2+012&year_to=&cubature_from=&cubature_to=&load_from=&load_to=&fuel=&mileage_from=&mileage_to=100+000&price_from=&price_to=300+000&location_country=&q=&crashed=0&maxAge=&nabidkovy=1&action=Hledej',
}]

const hasResultsNextPage = async (page) => {
  let nextPage = await page.evaluate((sel) => {
    const nextPage = document.querySelector('.paging a')
    return nextPage && nextPage.innerHTML === 'další'
  }, '.paging');
  return nextPage;
}

const parseResults = async (page) => {
  let results = await page.evaluate((sel) => {
    const elements = Array.from(document.querySelectorAll(`form.rows div.box a.thumbnail`));
    let links = elements.map(element => {
      return { link: element.href }
    })
    return links;
  }, 'form.rows');
  // parse detail
  console.log(`Loaded ${results.length} results, parsing details...`);
  for (key in results) {
    const result = results[key]
    console.log(`Parsing detail ${result.link}`);
    await page.goto(result.link);
    let creator = await page.evaluate((sel) => {
      const element = document.querySelector(`span[itemprop="seller"]`);
      return element ? element.innerHTML : null
    }, 'contact-container');
    results[key].creator = creator
  }
  return results
}

const getResults = async () => {
  console.log('Annonce scraper starting up');
  const browser = await puppeteer.launch({
    headless: true,
  });
  const page = await browser.newPage();
  let allTasksResults = []

  for (task of TASKS) {
    const { url, name } = task;
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
        await page.click('.paging a');
      }
    }
    while (run);
  
    console.log(name);
    console.log('total results', results.length);
    allTasksResults = allTasksResults.concat(results)
  }

  console.log('Annonce scraper shutting down');
  await browser.close();
  return allTasksResults
}

module.exports = getResults
