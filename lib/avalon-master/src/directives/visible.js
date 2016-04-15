
var none = 'none'
function parseDisplay(elem, val) {
    //用于取得此类标签的默认display值
    var doc = elem.ownerDocument
    var nodeName = elem.nodeName
    var key = '_' + nodeName
    if (!parseDisplay[key]) {
        var temp = doc.body.appendChild(doc.createElement(nodeName))
        if (avalon.modern) {
            val = getComputedStyle(temp, null).display
        } else {
            val = temp.currentStyle.display
        }
        doc.body.removeChild(temp)
        if (val === none) {
            val = 'block'
        }
        parseDisplay[key] = val
    }
    return parseDisplay[key]
}

avalon.parseDisplay = parseDisplay

avalon.directive('visible', {
    parse: function (binding, num) {
        return 'vnode' + num + '.props["ms-visible"] = ' + avalon.parseExpr(binding) + ';\n'
    },
    diff: function (cur, pre, steps, name) {
        var c = cur.props[name] = !!cur.props[name]
        cur.displayValue = pre.displayValue
        if (c !== pre.props[name]) {
            var list = cur.change || (cur.change = [])
            if(avalon.Array.ensure(list, this.update)){
                steps.count += 1
            }
        }
    },
    update: function (node, vnode) {
        var show = vnode.props['ms-visible']
        var display = node.style.display
        var value
        if (show) {
            if (display === none) {
                value = vnode.displayValue
                if (!value) {
                    node.style.display = ''
                }
            }
            if (node.style.display === '' && avalon(node).css('display') === none &&
                    // fix firefox BUG,必须挂到页面上
                    avalon.contains(node.ownerDocument, node)) {

                value = parseDisplay(node)
            }
        } else {
            if (display !== none) {
                value = none
                vnode.displayValue = display
            }
        }
        if (value !== void 0) {
            node.style.display = value
        }
    }
})

