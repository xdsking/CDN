

//缓存求值函数，以便多次利用
var evaluatorPool = require('./evaluatorPool')

var rregexp = /(^|[^/])\/(?!\/)(\[.+?]|\\.|[^/\\\r\n])+\/[gimyu]{0,5}(?=\s*($|[\r\n,.;})]))/g
var rstring = require('../../seed/regexp').string
var rfill = /\?\?\d+/g
var brackets = /\(([^)]*)\)/
var rAt = /(^|[^\w\u00c0-\uFFFF_])(@)(?=\w)/g
var rhandleName = /^\@[$\w]+$/
var rshortCircuit = /\|\|/g
var rpipeline = /\|(?=\w)/
var ruselessSp = /\s*(\.|\|)\s*/g
var wrapDuplex = function(arr){
    return '(function(){ return ' +arr.join('\n')+'})();\n'
}
function parseExpr(str, category) {

    var binding = {}
    category = category || 'other'
    if (typeof str === 'object') {
        category = str.type
        binding = str
        str = binding.expr
    }
    if (typeof str !== 'string')
        return ''
    var input = str.trim()
    var cacheStr = evaluatorPool.get(category + ':' + input)

    if (cacheStr) {
        return cacheStr
    }

    var number = 1
//相同的表达式生成相同的函数
    var maps = {}
    function dig(a) {
        var key = '??' + number++
        maps[key] = a
        return key
    }

    function fill(a) {
        return maps[a]
    }

    input = input.replace(rregexp, dig).//移除所有正则
            replace(rstring, dig).//移除所有字符串
            replace(rshortCircuit, dig).//移除所有短路或
            replace(ruselessSp, '$1').//移除. |两端空白
            split(rpipeline) //使用管道符分离所有过滤器及表达式的正体

//还原body
    var body = input.shift().replace(rfill, fill).trim()
    if (category === 'on' && rhandleName.test(body)) {
        body = body + '($event)'
    }

    body = body.replace(rAt, '$1__vmodel__.')
    if (category === 'js') {
        return evaluatorPool.put(category + ':' + input, body)
    }

//处理表达式的过滤器部分

    var filters = input.map(function (str) {

        str = str.replace(rfill, fill).replace(rAt, '$1__vmodel__.') //还原
        var hasBracket = false
        str = str.replace(brackets, function (a, b) {
            hasBracket = true
            return /\S/.test(b) ?
                    '(__value__,' + b + ');' :
                    '(__value__);'
        })
        if (!hasBracket) {
            str += '(__value__);'
        }
        str = str.replace(/(\w+)/, 'avalon.__format__("$1")')
        return '__value__ = ' + str
    })
    var ret = []
    if (category === 'on') {
        filters = filters.map(function (el) {
            return el.replace(/__value__/g, '$event')
        })
        if (filters.length) {
            filters.push('if($event.$return){\n\treturn;\n}')
        }
        ret = ['function self($event){',
            'try{',
            '\tvar __vmodel__ = this;',
            '\t' + body,
            '}catch(e){',
            quoteError(str, category),
            '}',
            '}']
        filters.unshift(2, 0)
    } else if (category === 'duplex') {

        //从vm中得到当前属性的值
        var getterBody = [
            'function (__vmodel__){',
            'try{',
            'return ' + body + '\n',
            '}catch(e){',
            quoteError(str, category),
            '}',
            '}']
       // fn = Function('return ' + getterBody.join('\n'))()
        evaluatorPool.put('duplex:' + str,wrapDuplex(getterBody))
        //给vm同步某个属性
        var setterBody = [
            'function (__vmodel__,__value__){',
            'try{',
            '\t' + body + ' = __value__',
            '}catch(e){',
            quoteError(str, category),
            '}',
            '}']
      //  fn = Function('return ' + setterBody.join('\n'))()
        evaluatorPool.put('duplex:set:' + str, wrapDuplex(setterBody))
        //对某个值进行格式化
        if (input.length) {
            var formatBody = [
                'function (__vmodel__, __value__){',
                'try{',
                filters.join('\n'),
                'return __value__\n',
                '}catch(e){',
                quoteError(str, category),
                '}',
                '}']
           // fn = Function('return ' + formatBody.join('\n'))()
            evaluatorPool.put('duplex:format:' + str, wrapDuplex(formatBody))
        }
        return
    } else {
        ret = [
            '(function(){',
            'try{',
            'var __value__ = ' + body,
            'return __value__',
            '}catch(e){',
            quoteError(str, category),
            '\treturn ""',
            '}',
            '})()'
        ]
        filters.unshift(3, 0)
    }

    ret.splice.apply(ret, filters)
    cacheStr = ret.join('\n')
    evaluatorPool.put(category + ':' + input, cacheStr)
    return cacheStr

}

function quoteError(str, type) {
    return '\tavalon.warn(e, ' +
            avalon.quote('parse ' + type + ' binding【 ' + str + ' 】fail')
            + ')'
}

module.exports = avalon.parseExpr = parseExpr
