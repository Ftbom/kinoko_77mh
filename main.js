const baseURL = 'https://www.77mh.in';

class MainController extends Controller {

    load(data) {
        this.id = data.id;
        this.url = data.url;
        this.page = 0;

        var cached = this.readCache();
        let list;
        if (cached) {
            list = cached.items;
        } else {
            list = [];
        }

        this.data = {
            list: list,
            loading: false,
            hasMore: this.id !== 'home'
        };

        this.userAgent = 'Mozilla/5.0 (Linux; Android 6.0; Nexus 5 Build/MRA58N) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/85.0.4183.102 Mobile Safari/537.36';

        if (cached) {
            let now = new Date().getTime();
            if (now - cached.time > 30 * 60 * 1000) {
                this.reload();
            }
        } else {
            this.reload();
        }

    }

    async onPressed(index) {
        await this.navigateTo('book', {
            data: this.data.list[index]
        });
    }

    onRefresh() {
        this.reload();
    }

    async onLoadMore() {
        this.setState(() => {
            this.data.loading = true;
        });
        try {
            let page = this.page + 1;
            let url = this.makeURL(page);
            let res = await fetch(url, {
                headers: {
                    'User-Agent': this.userAgent,
                },
            });
            let text = await res.text();
            this.page = page;
            let items = this.parseData(text, url);
    
            this.setState(()=>{
                for (let item of items) {
                    this.data.list.push(item);
                }
                this.data.loading = false;
                this.data.hasMore = this.id != 'home';
                console.log(`id: ${this.id} ${this.data.hasMore}`)
            });
        } catch (e) {
            showToast('没有更多了');
            this.data.hasMore = false;
            this.setState(()=>{
                this.data.loading = false;
            });
        }
        
    }

    makeURL(page) {
        if (this.id == 'home') {
            return this.url;
        } else if (page != 0) {
            return this.url.replace('.html', `_${page}.html`);
        } else {
            return this.url;
        }
    }

    async reload() {
        this.setState(() => {
            this.data.loading = true;
        });
        try {
            let url = this.makeURL(0);
            let res = await fetch(url, {
                headers: {
                    'User-Agent': this.userAgent,
                },
            });
            let text = await res.text();
            let items = this.parseData(text, url);
            this.page = 0;
            localStorage['cache_' + this.id] = JSON.stringify({
                time: new Date().getTime(),
                items: items,
            });
            this.setState(()=>{
                this.data.list = items;
                this.data.loading = false;
                this.data.hasMore = this.id != 'home';
            });
        } catch (e) {
            showToast(`${e}\n${e.stack}`);
            this.data.hasMore = false;
            this.setState(()=>{
                this.data.loading = false;
            });
        }
    }

    readCache() {
        let cache = localStorage['cache_' + this.id];
        if (cache) {
            let json = JSON.parse(cache);
            return json;
        }
    }

    parseData(text, url) {
        if (this.id == 'home') {
            return this.parseHomeData(text, url);
        } else {
            return this.parsePageData(text, url);
        } 
    }

    parseHomeData(html, url) {
        const doc = HTMLParser.parse(html);
        let results = [];
        let categroy_title = [];
        for (let item of doc.querySelector('#ConmmandComicTab1').querySelectorAll('a')) {
            categroy_title.push(item.textContent);
        }
        for (let i = 0; i < 3; i++) {
            results.push({
                header: true,
                title: categroy_title[i],
                icon: ''
            });
            let comic_items = doc.querySelector(`#ConmmandComicTab1_Content${i}`).querySelectorAll('li');
            for (let item of comic_items) {
                results.push({
                    title: item.querySelector('i').textContent,
                    subtitle: '',
                    link: baseURL + item.querySelector('a').getAttribute('href'),
                    picture: item.querySelector('img').getAttribute('src'),
                });
            }
        }
        return results;
    }

    parsePageData(text, url) {
        const doc = HTMLParser.parse(text);
        let results = [];
        let boxes = doc.querySelector('.ar_list_co').querySelectorAll('li');
        for (let box of boxes) {
            let item_info = box.querySelectorAll('a');
            let item = {};
            item.link = baseURL + item_info[0].getAttribute('href');
            item.picture = box.querySelector('img').getAttribute('src');
            item.title = item_info[1].textContent;
            item.subtitle = '';
            results.push(item);
        }
        return results;
    }
}

module.exports = MainController;