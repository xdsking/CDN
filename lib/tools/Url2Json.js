/**
 * Created by xuds on 2016/6/13.
 */
$.extend({
    //返回get请求参数对象
    getUrlVars: function (url) {
        var hash, myJson = {};
        var hashes = url.slice(url.indexOf('?') + 1).split('&');
        for (var i = 0; i < hashes.length; i++) {
            hash = hashes[i].split('=');
            myJson[hash[0]] = hash[1];
        }
        return myJson;
    }
});