/**
 * ------------------------------------------------------------
 * diff 对比新旧两个虚拟DOM树,根据directive中的diff方法为新虚拟DOM树
 * 添加change, afterChange更新钩子
 * ------------------------------------------------------------
 */
var emptyArr = []
var emptyObj = {
    children: [], props: {}
}
var directives = avalon.directives
var rbinding = require('../seed/regexp').binding

function diff(current, previous, steps) {
    if (!current)
        return
    for (var i = 0; i < current.length; i++) {
        var cur = current[i]
        var pre = previous[i] || emptyObj
        switch (cur.nodeType) {
            case 3:
                if (!cur.skipContent) {
                    directives.expr.diff(cur, pre, steps)
                }
                break
            case 8:
                if (cur.directive === 'for') {
                    i = directives['for'].diff(current, previous, steps, i)
                } else if (cur.directive) {//if widget
                    directives[cur.directive].diff(cur, pre, steps)
                }
                break
            default:
                if (!cur.skipAttrs) {
                    diffProps(cur, pre, steps)
                }
                if (!cur.skipContent) {
                    diff(cur.children, pre.children || emptyArr, steps)
                }
                break
        }
    }
}

function diffProps(current, previous, steps) {
    for (var name in current.props) {
        var match = name.match(rbinding)
        if (match) {
            var type = match[1]
            try {
                if (directives[type]) {
                    directives[type].diff(current, previous || emptyObj, steps, name)
                }
            } catch (e) {
                avalon.log(current, previous, e, 'diffProps error')
            }
        }
    }

}

module.exports = diff
