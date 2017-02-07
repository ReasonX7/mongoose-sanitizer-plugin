'use strict';

const sanitizer = require('sanitizer');

function sanitizerPlugin(schema, options) {
    const config = Object.assign({
        mode: 'escape',
        include: [],
        exclude: []
    }, options);

    const keys = (() => {
        const props = (config.include.length > 0 ? config.include : Object.keys(schema.obj));
        if (config.exclude.length > 0) {
            return props.filter(p => p.indexOf(config.exclude) === -1);
        }
        return props;
    })();

    return schema.pre('save', function (next) {
        keys.forEach(key => this[key] = sanitizer[config.mode](this[key]));
        next();
    });
}

module.exports = exports = sanitizerPlugin;