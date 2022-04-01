const URL = require('./baseurl');
const baseURL = URL.baseURL;

class IndexController extends Controller {
    load() {
        this.data = {
            tabs: [
                {
                    "title": "推荐",
                    "id": "home",
                    "url": baseURL,
                },
                {
                    "title": "完结漫画",
                    "id": "wanjie",
                    "url": baseURL + "/wanjie/index.html"
                },
                {
                    "title": "连载漫画",
                    "id": "lianzai",
                    "url": baseURL + "/lianzai/index.html"
                },
                {
                    "title": "最新上架漫画",
                    "id": "new",
                    "url": baseURL + "/new_coc.html"
                }, 
            ]
        };
    }
}

module.exports = IndexController;