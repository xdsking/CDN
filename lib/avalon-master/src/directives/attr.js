
var attrUpdate = require('../dom/attr/compact')

avalon.directive('attr', {
    parse: function (binding, num) {
        return 'vnode' + num + '.props["ms-attr"] = ' + avalon.parseExpr(binding) + ';\n'

    },
    diff: function (cur, pre, steps, name) {
        var a = cur.props[name]
        var p = pre.props[name]
        if (a && typeof a === 'object') {
            if (Array.isArray(a)) {
                a = cur.props[name] = avalon.mix.apply({}, a)
            }
            if (typeof p !== 'object') {
                cur.changeAttr = a
            } else {
                var patch = {}
                var hasChange = false
                for (var i in a) {
                    if (a[i] !== p[i]) {
                        hasChange = true
                        patch[i] = a[i]
                    }
                }
                if (hasChange) {
                    cur.changeAttr = patch
                }
            }
            if (cur.changeAttr) {
                var list = cur.change || (cur.change = [])
                if(avalon.Array.ensure(list, this.update)){
                   steps.count += 1
                }
            }
        } else {
            cur.props[name] = p
        }
        pre.changeAttr = null
    },
    //dom, vnode
    update: attrUpdate
})

