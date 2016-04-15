var expect = chai.expect
function heredoc(fn) {
    return fn.toString().replace(/^[^\/]+\/\*!?\s?/, '').
            replace(/\*\/[^\/]+$/, '').trim().replace(/>\s*</g, '><')
}
function fireClick(el) {
    if (el.click) {
        el.click()
    } else {
//https://developer.mozilla.org/samples/domref/dispatchEvent.html
        var evt = document.createEvent('MouseEvents')
        evt.initMouseEvent('click', true, true, window,
                0, 0, 0, 0, 0, false, false, false, false, 0, null);
        !el.dispatchEvent(evt);
    }
}

describe('on', function () {
    var body = document.body, div, vm
    beforeEach(function () {
        div = document.createElement('div')
        body.appendChild(div)
    })
    afterEach(function () {
        body.removeChild(div)
        delete avalon.vmodels[vm.$id]
    })
    it('test', function (done) {
        div.innerHTML = heredoc(function () {
            /*
             <div ms-controller='on' ms-click='@a($event)' data-aaa=eee >111
             <div ms-click=@b($event,111) id='a111'>
             
             </div>
             </div>
             */
        })
        var index = 1
        vm = avalon.define({
            $id: 'on',
            a: function (e) {
                index++
                expect(e.currentTarget.getAttribute('data-aaa')).to.equal('eee')
            },
            b: function (e, b) {
                index++
                expect(e.type).to.equal('click')
                expect(b).to.equal(111)
            }
        })
        avalon.scan(div)
        var elem = document.getElementById('a111')
        fireClick(elem)
        setTimeout(function () {
            expect(index).to.equal(3)
            done()
        }, 100)
    })

    it('stopPropagation', function (done) {
        div.innerHTML = heredoc(function () {
            /*
             <div ms-controller='on2' ms-click='@a($event)' data-aaa=eee >111
             <div ms-click=@b($event,33) id='a222'>
             
             </div>
             </div>
             */
        })
        var index = 1
        vm = avalon.define({
            $id: 'on2',
            a: function (e) {
                index++
            },
            b: function (e, b) {
                index++
                expect(e.type).to.equal('click')
                expect(b).to.equal(33)
                e.stopPropagation()
            }
        })
        avalon.scan(div, vm)
        var elem = document.getElementById('a222')
        fireClick(elem)
        setTimeout(function () {
            expect(index).to.equal(2)
            done()
        })
    })

    it('stop:filter', function (done) {
        div.innerHTML = heredoc(function () {
            /*
             <div ms-controller='on3' ms-click='@a($event)' data-aaa=eee >111
             <div ms-click='@b($event,33) |stop' id='a222'>
             
             </div>
             </div>
             */
        })
        var index = 1
        vm = avalon.define({
            $id: 'on3',
            a: function (e) {
                index++
            },
            b: function (e, b) {
                index++
                expect(e.type).to.equal('click')
                expect(b).to.equal(33)
            }
        })
        avalon.scan(div, vm)
        var elem = document.getElementById('a222')
        fireClick(elem)
        setTimeout(function () {
            expect(index).to.equal(2)
            done()
        })
    })

    it('multi-click-bind', function (done) {
        div.innerHTML = heredoc(function () {
            /*
             <div ms-controller='on4' 
             id='a33'
             ms-click='@a' 
             ms-click-2='@c' 
             ms-click-4='@b' 
             ms-click-1='@d'  >TEST
             
             </div>
             */
        })
        var str = ""
        var vm = avalon.define({
            $id: 'on4',
            a: function (e) {
                str += "a"
            },
            b: function (e) {
                str += "b"
            },
            c: function (e) {
                str += "c"
            },
            d: function (e) {
                str += "d"
            }
        })

        avalon.scan(div, vm)
        var elem = document.getElementById('a33')
        fireClick(elem)
        setTimeout(function () {
            expect(str).to.equal("adcb")
            done()
        })
    })

})

