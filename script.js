const Scrappey = require('scrappey');
const cheerio = require('cheerio')
const fs = require('fs');

// Replace the following details with your own details
const SCRAPPEY_API_KEY = 'API_KEY_HERE';

// Create an instance of Scrappey
const scrappey = new Scrappey(SCRAPPEY_API_KEY);

const URL_TO_SCRAPE = `https://www.similarweb.com/website/google.com/#traffic`

/**
 * Extracts the data from the html
 * @param {*} html 
 */
function extractData(html) {
    const $ = cheerio.load(html);

    /**
     * Title
     */
    const name = $(`p[class='wa-overview__title']`).text()

    /**
     * Global, Country and Category Rank
     */
    const globalRankArray = []
    $('p[class="wa-rank-list__value"]').each((index, element) => {
        globalRankArray.push($(element).text());
    });

    /**
     * Egagement Rank
     */
    const engagementRank = []
    $('p[class="engagement-list__item-value"]').each((index, element) => {
        engagementRank.push($(element).text());
    });

    /**
     * Chart Data
     */
    const chartData = []
    $('tspan[class="wa-traffic__chart-data-label"]').each((index, element) => {
        chartData.push($(element).text());
    });

    const topCountriesData = []
    $('span[class="app-parameter-change app-parameter-change--sm app-parameter-change--up"]').each((index, element) => {
        topCountriesData.push({
            amount: $(element).parent().parent().find('span[class="wa-geography__country-traffic-value"]').text(),
            change: $(element).text(),
            country: $(element).parent().parent().find('a').text(),
        });
    });

    console.log(`name`, name)
    console.log(`ranking `, globalRankArray)
    console.log(`engagement`, engagementRank)
    console.log(`chartData`, chartData)
    console.log(`topCountriesData`, topCountriesData)
}

/**
 * Runs the script
 */
async function run() {
    try {
        const sessionRequest = await scrappey.createSession();
        const session = sessionRequest.session;

        console.log('Created Session:', session);

        let get;
        try {
            get = await scrappey.getRequest({
                url: URL_TO_SCRAPE,
                session: session
            })
        } catch (exp) {
            throw Error(`Scrape failed: ${exp}`)
        }

        console.log(get)

        //On live data use this
        const html = get.solution.response

        //Example just for testign load pre-scraped the .html
        // const html = fs.readFileSync('index.html', 'utf-8');

        extractData(html)

        // Manually destroy the session (automatically destroys after 4 minutes)
        await scrappey.destroySession(session);
        console.log('Session destroyed.');
    } catch (error) {
        console.error(error);
    }
}

run()

