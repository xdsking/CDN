var assert = chai.assert;
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
describe('duplex', function () {
    var body = document.body, div, vm
    beforeEach(function () {
        div = document.createElement('div')
        body.appendChild(div)
    })
    afterEach(function () {
        if (div.parentNode === body) {
            body.removeChild(div)
            delete avalon.vmodels[vm.$id]
        }
    })
    it('数据转换', function (done) {
        div.innerHTML = heredoc(function () {
            /*
             <div ms-controller='duplex1' >
             <input ms-duplex-string='@aaa|limitBy(4)'><span>{{@aaa}}</span>
             <input ms-duplex-number='@bbb' ><span>{{@bbb}}</span>
             <input ms-duplex-boolean='@ccc' ><span>{{@ccc}}</span>
             <input ms-duplex-checked='@ddd' type='radio' ><span>{{@ddd}}</span>
             </div>
             */
        })
        vm = avalon.define({
            $id: 'duplex1',
            aaa: 12345,
            bbb: '123a',
            ccc: 'true',
            ddd: true

        })
        avalon.scan(div, vm)
        setTimeout(function () {
            var inputs = div.getElementsByTagName('input')
            var spans = div.getElementsByTagName('span')

            expect(inputs[0].value).to.equal('1234')
            expect(vm.aaa).to.equal('1234')
            expect(spans[0].innerHTML).to.equal('1234')
            expect(inputs[1].value).to.equal('123')
            expect(vm.bbb).to.equal(123)
            expect(spans[1].innerHTML).to.equal('123')
            expect(inputs[2].value).to.equal('true')
            expect(vm.ccc).to.equal(true)
            expect(spans[2].innerHTML).to.equal('true')
            expect(vm.ddd).to.equal(true)
            expect(spans[3].innerHTML).to.equal('true')
            expect(inputs[3].checked).to.equal(true)
            vm.bbb = '333b'
            vm.ccc = 'NaN'
            vm.ddd = false
            setTimeout(function () {
                expect(inputs[1].value).to.equal('333')
                expect(vm.bbb).to.equal(333)
                expect(spans[1].innerHTML).to.equal('333')
                expect(inputs[2].value).to.equal('false')
                expect(vm.ccc).to.equal(false)
                expect(spans[2].innerHTML).to.equal('false')
                expect(spans[3].innerHTML).to.equal('false')
                expect(inputs[3].checked).to.equal(false)
                done()
            }, 100)//chrome 37还是使用定时器，需要延迟足够的时间

        }, 100)

    })
    it('checkbox', function (done) {
        div.innerHTML = heredoc(function () {
            /*
             <div ms-controller='duplex2' >
             <input ms-duplex-number='@aaa' value='111' type='checkbox'>
             <input ms-duplex-number='@aaa' value='222' type='checkbox'>
             <input ms-duplex-number='@aaa' value='333' type='checkbox'>
             </div>
             */
        })
        vm = avalon.define({
            $id: 'duplex2',
            aaa: [333]

        })
        avalon.scan(div, vm)
        setTimeout(function () {
            var inputs = div.getElementsByTagName('input')
            expect(inputs[0].checked).to.equal(false)
            expect(inputs[1].checked).to.equal(false)
            expect(inputs[2].checked).to.equal(true)
            fireClick(inputs[0])
            fireClick(inputs[1])
            fireClick(inputs[2])
            setTimeout(function () {
                expect(vm.aaa.concat()).to.eql([111, 222])
                done()
            }, 100)
        })
    })

    it('select', function (done) {
        div.innerHTML = heredoc(function () {
            /*
             <div ms-controller='duplex3' >
             <select ms-duplex-number='@aaa' multiple="true">
             <option>111</option>
             <option>222</option>
             <option>333</option>
             <option>444</option>
             </select>
             </div>
             */
        })
        vm = avalon.define({
            $id: 'duplex3',
            aaa: [111, 444]

        })
        avalon.scan(div, vm)
        setTimeout(function () {
            var options = div.getElementsByTagName('option')
            expect(options[0].selected).to.equal(true)
            expect(options[1].selected).to.equal(false)
            expect(options[3].selected).to.equal(true)

            done()

        })
    })

    it('textarea & contenteditable', function (done) {
        div.innerHTML = heredoc(function () {
            /*
             <div ms-controller='duplex4'>
             <textarea ms-duplex='@aaa | uppercase'></textarea>
             <blockquote ms-duplex='@bbb | lowercase' contenteditable='true'><div>2222</div></blockquote>
             </div>
             */
        })
        vm = avalon.define({
            $id: 'duplex4',
            aaa: "aaa",
            bbb: "BBB"
        })
        avalon.scan(div, vm)
        setTimeout(function () {
            var textareas = div.getElementsByTagName('textarea')
            var blockquote = div.getElementsByTagName('blockquote')

            expect(textareas[0].value).to.equal('AAA')
            expect(blockquote[0].innerHTML).to.equal('bbb')
            vm.aaa = "aaa_bbb"
            vm.bbb = 'fff_AAA'
            setTimeout(function () {
                expect(textareas[0].value).to.equal('AAA_BBB')
                expect(blockquote[0].innerHTML).to.equal('fff_aaa')
                done()
            }, 80)
        }, 100)
    })

    it('select2', function (done) {
        div.innerHTML = heredoc(function () {
            /*
             <div ms-controller='duplex5' >
             <select ms-duplex='@aaa'>
             <option>
             aaa
             </option>
             <option>
             bbb
             </option>
             <option>
             ccc
             </option>
             <option>
             ddd
             </option>
             </select><input ms-duplex='@aaa'><span>{{@aaa}}</span> 
             <select ms-duplex-number='@bbb' multiple='true'>
             <option>
             111
             </option>
             <option>
             222
             </option>
             <option>
             333
             </option>
             <option>
             444
             </option>
             </select>
             </div>
             */
        })
        var vm = avalon.define({
            $id: 'duplex5',
            aaa: "ccc",
            bbb: [111, 444]
        })
        avalon.scan(div, vm)
        setTimeout(function () {
            var options = div.getElementsByTagName('option')
            var inputs = div.getElementsByTagName('input')
            var spans = div.getElementsByTagName('span')
            expect(options[2].selected).to.equal(true)
            expect(options[4].selected).to.equal(true)
            expect(options[5].selected).to.equal(false)
            expect(options[6].selected).to.equal(false)
            expect(options[7].selected).to.equal(true)
            expect(spans[0].innerHTML).to.equal('ccc')
            expect(inputs[0].value).to.equal('ccc')
            inputs[0].value = 'bbb'
            options[4].selected = false
            options[5].selected = true
            options[6].selected = true
            options[7].selected = false
            avalon.fireDom(div.getElementsByTagName('select')[1],'change')
            setTimeout(function () {
                expect(options[2].selected).to.equal(false)
                expect(options[1].selected).to.equal(true)
                expect(spans[0].innerHTML).to.equal('bbb')
                expect(vm.bbb.concat()).to.eql([222,333])
                done()
            })



        }, 80)
    })
})