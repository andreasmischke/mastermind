// See http://brunch.io for documentation.
exports.server = {
    hostname: '0.0.0.0'
};
exports.plugins = {
    babel: {presets: ['es2015', 'es2016', 'react']}};
exports.files = {
    javascripts: {joinTo: 'app.js'},
    stylesheets: {joinTo: 'app.css'},
    templates: {joinTo: 'app.js'}
};
