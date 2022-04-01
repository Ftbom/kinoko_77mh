const URL = require('./baseurl');
const baseURL = URL.baseURL;

function parseData(text, url) {
    const doc = HTMLParser.parse(text);
    let results = [];
    let info = doc.querySelector('.ar_list_coc').querySelector('.ar_list_coc').querySelectorAll('li');
    let subtitle = info[1].querySelector('a').textContent;
    let state = info[2].querySelector('a').textContent;
    let summary = doc.querySelector('.ar_list_coc').querySelector('.ar_list_coc').querySelector('i').textContent;
    let comic_list = doc.querySelector('.ar_rlos_bor').querySelectorAll('li');
    for (let list of comic_list) {
        results.push({
            link: baseURL + list.querySelector('a').getAttribute('href'),
            title: list.querySelector('a').textContent,
        });
    }
    return {
        subtitle: subtitle,
        summary: summary,
        state : state,
        list: results.reverse(),
    };
}

module.exports = async function(url) {
    let res = await fetch(url, {
        headers: {
            'User-Agent': 'Mozilla/5.0 (Linux; Android 6.0; Nexus 5 Build/MRA58N) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/85.0.4183.102 Mobile Safari/537.36',
        }
    });
    let text = await res.text();
    return parseData(text, url);
}
