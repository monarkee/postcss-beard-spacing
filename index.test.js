var postcss = require('postcss')
var fs = require('fs')

var plugin = require('./')

function run(fixture, opts) {
    var expected = fs.readFileSync(fixture, 'utf-8')

    return postcss([plugin(opts)]).process('').then(result => {
        expect(result.css).toEqual(expected.trim())
        expect(result.warnings().length).toBe(0)
    })
}

it('it creates helper classes from a spacing-scale config', () => {
    return run('fixture.css', {
        breakpoints: {
            sm: '(min-width: 300px)',
            md: '(min-width: 600px)',
            lg: '(min-width: 900px)',
        },

        spacingScale: {
            1: '15rem',
            2: '20rem',
        },
    })
})
