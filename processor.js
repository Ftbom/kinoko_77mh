const bookFetch = require('./book_fetch');

/**
 * @property {String}key need override the key for caching
 * @method load need override,
 * @method checkNew need override
 */
class MangaProcesser extends Processor {

    // The key for caching data
    get key() {
        return this.data.link;
    }

    /**
     * 
     * Start load pictures
     * 
     * @param {*} state The saved state.
     */
     async load(state) {
        try {
            let url = this.data.link;
            let res = await fetch(url);
            let text = await res.text();
            let doc = HTMLParser.parse(text);
            let data = [];
            let script = doc.querySelectorAll('script:not([str])')[0].textContent;
            let start = script.search('maxPage');
            let end = script.search('msg');
            let img_urls = script.substring(start + 8, end - 1).split('|');
            let cid = doc.querySelector('#backTitle').querySelector('a').getAttribute('href');
            res = await fetch(`https://css.gdbyhtl.net:5443/img_v1/cn_svr.asp?z=gn&s=61&cid=${cid.substring(8, cid.length - 5)}&coid=${url.substring(27, url.length - 5)}`);
            text = await res.text();
            let img_url_front = text.substring(49, text.length - 20);
            for (let img_url of img_urls) {
                data.push({
                    url: img_url_front + img_url,
                    headers: {
                        Referer: url
                    }
                });
            }
            this.setData(data);
            this.save(true, state);
            this.loading = false;
        } catch (e) {
            console.log(`err ${e}\n${e.stack}`);
            this.loading = false;
        }
    }

    async fetch(url) {
        console.log(`request ${url}`);
        let res = await fetch(url, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Linux; Android 6.0; Nexus 5 Build/MRA58N) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/85.0.4183.102 Mobile Safari/537.36',
            }
        });
        let text = await res.text();
        return HTMLParser.parse(text);
    }

    // Called in `dispose`
    unload() {

    }

    // Check for new chapter
    async checkNew() {
        let url = this.data.link;
        let data = await bookFetch(url);
        var item = data.list[data.list.length - 1];
        /**
         * @property {String}title The last chapter title.
         * @property {String}key The unique identifier of last chpater.
         */
        return {
            title: item.title,
            key: item.link,
        };
    }
}

module.exports = MangaProcesser;