var postcss = require('postcss')
var _ = require('lodash')
var valueParser = require('postcss-value-parser')

var helpers = {
    pa: ['padding-top', 'padding-right', 'padding-bottom', 'padding-left'],
    pv: ['padding-top', 'padding-bottom'],
    ph: ['padding-left', 'padding-right'],
    pt: ['padding-top'],
    pr: ['padding-right'],
    pb: ['padding-bottom'],
    pl: ['padding-left'],

    ma: ['margin-top', 'margin-right', 'margin-bottom', 'margin-left'],
    mv: ['margin-top', 'margin-bottom'],
    mh: ['margin-left', 'margin-right'],
    mt: ['margin-top'],
    mr: ['margin-right'],
    mb: ['margin-bottom'],
    ml: ['margin-left'],
}

module.exports = postcss.plugin('postcss-beard-spacing', function(opts) {
    opts = opts || {}

    var breakpoints = opts.breakpoints
    var spacingScale = opts.spacingScale

    return function(root, result) {
        let spacers = _.flatMap(spacingScale, function(scaleValue, scaleKey) {
            return _.map(helpers, function(helper, key) {
                return makeFunctionalRule(
                    `.${key}${scaleKey}`,
                    helper,
                    scaleValue
                )
            })
        })

        let responsive = generateResponsiveRules(breakpoints, spacingScale)

        root.append(spacers.concat(responsive))
    }
})

/**
 * Make a functional CSS rule
 * @param  {string} selector   The selector to use including a dot or hash (. or #)
 * @param  {array} properties The property names to assign to the declaration
 * @param  {string} value      The value for each declaration
 * @return {array}            an array of PostCSS Rules
 */
const makeFunctionalRule = function(selector, properties, value) {
    let rule = postcss.rule({selector: selector})

    let decls = _.map(properties, function(property) {
        return postcss.decl({prop: property, value: value})
    })

    rule.append(decls)

    return rule
}

/**
 * Generate a complete set of responsive spacing helpers
 * @param  {object} breakpoints A set of breakpoints to generate the spacer for
 * @param  {object} spacingScale The spacing scale to use
 * @return {array}             Rules
 */
const generateResponsiveRules = function(breakpoints, spacingScale) {
    return _.map(breakpoints, function(breakpointValue, breakpointKey) {
        let mediaQuery = postcss.atRule({
            name: 'media',
            params: breakpointValue,
        })

        let rules = _.flatMap(spacingScale, function(scaleValue, scaleKey) {
            return _.map(helpers, function(helperValues, helperKey) {
                return makeFunctionalRule(
                    `.${breakpointKey}-${helperKey}${scaleKey}`,
                    helperValues,
                    scaleValue
                )
            })
        })

        return mediaQuery.append(rules)
    })
}
