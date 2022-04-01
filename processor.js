const bookFetch = require('./book_fetch');
const URL = require('./baseurl');
const baseURL = URL.baseURL;
const server_list = ['https://picsh.77dm.top/h', 'https://a16d.gdbyhtl.net:64443/h',
                    'https://imgsh.dm365.top/h', 'https://imgmum.dm365.top:2096/h', 'https://hws.gdbyhtl.net/h'];
//可通过https://css.gdbyhtl.net:5443/img_v1/{0}.asp?z=gn&s={1}&cid={2}&coid={3}获取图片服务器地址
//0 可选：'cn_svr', 'hwcf_svr', 'hw2_svr', 'cncf_svr', 'fdc_svr', 'cnlo_svr'
//1 通过script获取img_s
//2 漫画id
//3 漫画章节id
//获取的服务器列表如下：
//https://imgsh.dm365.top/h{img_s}
//https://picsh.77dm.top/h{img_s}
//https://hws.gdbyhtl.net/h{img_s}
//https://imgmum.dm365.top:2096/h{img_s}
//https://a16d.gdbyhtl.net:64443/h{img_s}

//通过网页获取的代码
function a(p,a,c,k,e,d)
{
    e=function(c)
    {
        return (c<a?'':e(parseInt(c/a)))+((c=c%a)>35?String.fromCharCode(c+29):c.toString(36))
    };
    if(!''.replace(/^/,String))
    {
        while(c--)
        {
            d[e(c)]=k[c]||e(c)
        }
        k=[function(e){return d[e]}];
        e=function()
        {
            return '\\w+'
        };
        c=1
    };
    while(c--)
    {
        if(k[c])
        {
            p=p.replace(new RegExp('\\b'+e(c)+'\\b','g'),k[c])
        }
    }
    return p
}

/**
 * @property {String}key need override the key for caching
 * @method load need override,
 * @method checkNew need override
 */
class MangaProcesser extends Processor {

    // The key for caching data
    get key() {
        return this.data.link.substring(0, this.data.link.length - 1);
    }

    /**
     * 
     * Start load pictures
     * 
     * @param {*} state The saved state.
     */
     async load(state) {
        try {
            let server_num = parseInt(this.data.link[this.data.link.length - 1]);
            let url = this.data.link.substring(0, this.data.link.length - 1);
            let res = await fetch(url, {
                headers: {
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:98.0) Gecko/20100101 Firefox/98.0',
                }
            });
            let text = await res.text();
            let doc = HTMLParser.parse(text);
            let data = [];
            let script = doc.querySelectorAll('script:not([str])')[0].textContent;
            script = script.substring(328, script.length - 20) //获取数据
            let b = script.split(',');
            b[0] = b[0].substring(0, b[0].length - 1);
            b[1] = parseInt(b[1]);
            b[2] = parseInt(b[2]);
            b[3] = b[3].substring(1, b[3].length);
            let result = a(b[0], b[1], b[2], b[3].split('|'), 0, {}); //返回图片列表信息
            let start = result.search('msg');
            let end = result.search('maxPage');
            let img_s = result.substring(result.search('img_s') + 6, result.search('var preLink') - 1);
            let img_data = result.substring(start + 6, end - 7).split('|');
            for (let img of img_data) {
                data.push({
                    url: server_list[server_num] + img_s + '/' + img,
                    headers: {
                        Referer: baseURL
                    }
                });
            }
            this.setData(data);
            this.save(false, state); //每次进入重新加载，用于切换服务器
            this.loading = false;
        } catch (e) {
            console.log(`err ${e}\n${e.stack}`);
            this.loading = false;
        }
    }

    // Called in `dispose`
    unload() {

    }

    // Check for new chapter
    async checkNew() {
        let url = this.data.link.substring(0, this.data.link.length - 1);
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