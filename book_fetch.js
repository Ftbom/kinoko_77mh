function parseData(text, url) {
    const doc = HTMLParser.parse(text);
    let results = [];
    let subtitle = doc.querySelector('.pub-duration').querySelector('a').textContent;
    let state = doc.querySelector('.comic-pub-state').textContent;
    let summary = doc.querySelector('.comic_story').textContent;
    let comic_list = doc.querySelectorAll('.links-of-books');
    for (let list of comic_list) {
        for (let info of list.querySelectorAll('a')) {
            results.push({
                link: info.getAttribute('href'),
                title: info.textContent,
            });
        }
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
