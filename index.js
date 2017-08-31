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
            return generateSpacer(breakpoints, scaleValue, scaleKey)
        })

        root.prepend(spacers)
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
 * Generate a complete set of spacing helpers
 * @param  {object} breakpoints A set of breakpoints to generate the spacer for
 * @param  {string} value       The value for each declaration in each rule
 * @param  {string} key         The key in the scale to use
 * @return {array}             Rules
 */
const generateSpacer = function(breakpoints, scaleValue, scaleKey) {
    // Generate the base rules
    let rules = _.flatMap(helpers, function(helper, key) {
        return makeFunctionalRule(`.${key}${scaleKey}`, helper, scaleValue)
    })

    // Generate the responsive rules
    let responsiveRules = _.flatMap(breakpoints, function(
        breakpointValue,
        breakpointKey
    ) {
        let mediaQuery = postcss.atRule({
            name: 'media',
            params: breakpointValue,
        })

        let rules = _.flatMap(helpers, function(helper, key) {
            return makeFunctionalRule(
                `.${breakpointKey}-${key}${scaleKey}`,
                helper,
                scaleValue
            )
        })

        return mediaQuery.append(rules)
    })

    // Join the sets of rules together
    return rules.concat(responsiveRules)
}
