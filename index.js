var Stremio = require("stremio-addons");

// Enable server logging for development purposes
process.env.STREMIO_LOGGING = true; 

// Define manifest object
var manifest = { 
    // See https://github.com/Stremio/stremio-addons/blob/master/docs/api/manifest.md for full explanation
    id: "org.stremio.sf",
    version: "1.0.0",

    name: "SFshare",
    description: "fshare",
    icon: "https://www.iconfinder.com/icons/2799202/download/png/256", 
    background: "http://dark.pozadia.org/images/wallpapers/18807153/Dark/Gothic%20Architecture%20Building.jpg",

    // Properties that determine when Stremio picks this add-on
    types: ["movie","series","tv","channel"], // your add-on will be preferred for those content types
    idProperty: ['imdb_id'], // the property to use as an ID for your add-on; your add-on will be preferred for items with that property; can be an array
    // We need this for pre-4.0 Stremio, it's the obsolete equivalent of types/idProperty
    filter: { "query.imdb_id": { "$exists": true }, "query.type": { "$in": ["movie","series","tv","channel"] } },

    // Adding a sort would add a tab in Discover and a lane in the Board for this add-on
    sorts: [ {prop: "popularities.sfshare", name: "SFshare", types: ["movie","series","tv","channel"]}],
};

var dataset = {};

var methods = { };

var addon = new Stremio.Server({
    "stream.find": function(args, callback) {
        console.log("received request from stream.find", args)
        // callback expects array of stream objects
    },
    "meta.find": function(args, callback) {
        console.log("received request from meta.find", args)
        // callback expects array of meta object (primary meta feed)
        // it passes "limit" and "skip" for pagination
    },
    "meta.get": function(args, callback) {
        console.log("received request from meta.get", args)
        // callback expects one meta element
    },
    "meta.search": function(args, callback) {
        console.log("received request from meta.search", args)
        // callback expects array of search results with meta objects
        // does not support pagination
    },
}, manifest);

if (require.main===module) var server = require("http").createServer(function (req, res) {
    addon.middleware(req, res, function() { res.end() }); // wire the middleware - also compatible with connect / express
}).on("listening", function()
{
    var port = server.address().port;
    console.log("Sample Stremio Addon listening on "+port);
    console.log("You can test this add-on via the web app at: http://app.strem.io/#/discover/movie?addon="+encodeURIComponent('http://localhost:'+port))
}).listen(process.env.PORT || 7000);

// Export for local usage
module.exports = addon;