var Stremio = require("stremio-addons");

process.env.STREMIO_LOGGING = true; // enable server logging for development purposes

var manifest = { 
    // See https://github.com/Stremio/stremio-addons/blob/master/docs/api/manifest.md for full explanation
    "id": "org.stremio.helloworld",
    "version": "1.0.0",

    "name": "Example Addon",
    "description": "Sample addon providing a few public domain movies",
    "icon": "URL to 256x256 monochrome png icon", 
    "background": "URL to 1366x756 png background",

    // Properties that determine when Stremio picks this add-on
    "types": ["movie", "series"], // your add-on will be preferred for those content types
    "idProperty": "imdb_id", // the property to use as an ID for your add-on; your add-on will be preferred for items with that property; can be an array
    // We need this for pre-4.0 Stremio, it's the obsolete equivalent of types/idProperty
    "filter": { "query.imdb_id": { "$exists": true }, "query.type": { "$in":["series","movie"] } }
};

var dataset = {
    // Some examples of streams we can serve back to Stremio ; see https://github.com/Stremio/stremio-addons/blob/master/docs/api/stream/stream.response.md
    "tt0051744": { infoHash: "9f86563ce2ed86bbfedd5d3e9f4e55aedd660960" }, // house on haunted hill 1959
    "tt1254207": { url: "http://clips.vorwaerts-gmbh.de/big_buck_bunny.mp4", availability: 1 }, // big buck bunny, HTTP stream
    "tt0031051": { yt_id: "m3BKVSpP80s", availability: 3 }, // The Arizona Kid, 1939; YouTube stream
    "tt0137523": { externalUrl: "https://www.netflix.com/watch/26004747" }, // Fight Club, 1999; redirect to Netflix
};

var methods = { };
var addon = new Stremio.Server(methods, manifest);

var server = require("http").createServer(function (req, res) {
    addon.middleware(req, res, function() { res.end() }); // wire the middleware - also compatible with connect / express
}).on("listening", function()
{
    console.log("Sample Stremio Addon listening on "+server.address().port);
}).listen(process.env.PORT || 7000);

/* Methods
 */
methods["stream.find"] = function(args, callback) {
    if (! args.query) return callback();
    callback(null, [dataset[args.query.imdb_id]]);
}

// Add a "Hello World" tab in Discover by adding our own sort
manifest.sorts = [{ prop: "popularities.helloWorld", name: "Hello World", types: ["movie"] }];

// To provide meta for our movies, we'll just proxy the official cinemeta add-on
var client = new Stremio.Client();
client.add("http://cinemeta.strem.io/stremioget/stremio/v1");

methods["meta.find"] = function(args, callback) {
    // Proxy Cinemeta, but get only our movies
    args.query.imdb_id = args.query.imdb_id || { $in: Object.keys(dataset) };
    client.meta.find(args, function(err, res) {
        callback(err, res ? res.map(function(r) { r.popularities = { helloWorld: 10000 }; return r }) : null);
    });
}