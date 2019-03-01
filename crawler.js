const https = require('https');
var cheerio = require('cheerio');
var URL = require('url-parse');
var fs = require('fs');

var starturl = "https://medium.com";

var pagesVisited = {};
var numPagesVisited = 0;
var pagesToVisit = [];
var totalpages = 1;
var url = new URL(starturl);
var baseUrl = url.protocol + "//" + url.hostname;

fs.writeFile('links.txt', "", function (err) {
    if (err) throw err;
});


pagesToVisit.push(starturl);
crawl()

function crawl() {
    if (numPagesVisited == totalpages) {
        console.log("Crawled " + numPagesVisited + " from " + starturl);
        return;
    }
    setTimeout(() => {
        const nextPage1 = pagesToVisit.pop();
        if (nextPage1) {
            if (nextPage1 in pagesVisited) {
                crawl();
            } else {
                visitPage(nextPage1, crawl, 1);
            }
        }
    }, 5000);
    setTimeout(() => {
        const nextPage2 = pagesToVisit.pop();
        if (nextPage2) {
            if (nextPage2 in pagesVisited) {
                crawl();
            } else {
                visitPage(nextPage2, crawl, 2);
            }
        }
    }, 10000);
    setTimeout(() => {
        const nextPage3 = pagesToVisit.pop();
        if (nextPage3) {
            if (nextPage3 in pagesVisited) {
                crawl();
            } else {
                visitPage(nextPage3, crawl, 3);
            }
        }
    }, 15000);
    setTimeout(() => {
        const nextPage4 = pagesToVisit.pop();
        if (nextPage4) {
            if (nextPage4 in pagesVisited) {
                crawl();
            } else {
                visitPage(nextPage4, crawl, 4);
            }
        }
    }, 20000);
    setTimeout(() => {
        const nextPage5 = pagesToVisit.pop();
        if (nextPage5) {
            if (nextPage5 in pagesVisited) {
                crawl();
            } else {
                visitPage(nextPage5, crawl, 5);
            }
        }
    }, 25000);
}

function visitPage(url, crawl, request) {
    numPagesVisited++;
    pagesVisited[url] = true;
    fs.appendFile('links.txt', url + '\n', function (err) {
        if (err) throw err;
    });

    // console.log("[" + numPagesVisited + "/" + totalpages + "] Visiting page " + url);
    console.log("visitpage " + request + " " + url);
    https.get(url, (response) => {
        let data = '';

        response.on('data', (chunk) => {
            data += chunk;
        });

        response.on('end', () => {
            console.log("Status code: " + response.statusCode);
            if (response.statusCode !== 200) {
                crawl();
                return;
            }
            if (response.statusCode == 429) {
                setTimeout(() => {
                    var $ = cheerio.load(data);
                    collectInternalLinks($);
                    crawl();
                }, 5000);
            }
            else {
                // Parse the document data
                var $ = cheerio.load(data);
                collectInternalLinks($);
                crawl();
            }
        });
    }).on("error", (err) => {
        console.log("Error: " + err.message);
    });
}

function collectInternalLinks($) {
    var relativeLinks = $("a[href^='/']");
    relativeLinks.each(function () {
        if ((baseUrl + $(this).attr('href')) in pagesVisited) {
            // console.log("already visited: " + baseUrl + $(this).attr('href'));            
        }
        else {
            if ($(this).attr('href').includes('/m/') || $(this).attr('href').includes('/me/') || $(this).attr('href').match(/(@)\w+/g)) {
                console.log("skipping restricted link");
            }
            else {
                pagesToVisit.push(baseUrl + $(this).attr('href'));
                totalpages++;
            }
        }
    });

    var absoluteLinks = $("a[href^='http']");
    absoluteLinks.each(function () {
        if ($(this).attr('href') in pagesVisited) {
            // console.log("already visited: " + $(this).attr('href'));            
        }
        else if ($(this).attr('href').includes(url.hostname)) {
            if ($(this).attr('href').includes('/m/') || $(this).attr('href').includes('/me/') || $(this).attr('href').match(/(@)\w+/g)) {
                console.log("skipping restricted link");
            }
            else {
                let httpsurl = $(this).attr('href');
                pagesToVisit.push(httpsurl.replace('http://', 'https://'));
                totalpages++;
            }
        }
    });
}