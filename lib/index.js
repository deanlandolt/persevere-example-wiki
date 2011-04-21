// helpful for debugging
print = require("promised-io/lib/process").print;

var pinturaApp;
var settings = require("commonjs-utils/lib/settings");
var multiNode = require("multi-node");
var Static = require("pintura/lib/jsgi/static").Static;
var start = require("pintura/lib/start-node").start;

if (typeof require.reloadable === "function") {
	require.reloadable(function(){
		pinturaApp = require("pintura").app;
		require("./app");
	});
}
else {
	pinturaApp = require("pintura").app;
	require("./app");
}

start(
	// uncomment this to enable compression with node-compress
	//require("pintura/lib/jsgi/compress").Compress(
	// make the root url redirect to /Page/Root  
	require("./jsgi/redirect-root").RedirectRoot(
		require("pintura/lib/jsgi/cascade").Cascade([ 
			// cascade from static to pintura REST handling
			// the main place for static files accessible from the web
			Static({urls:[""], root: "public", directoryListing: true}),
			Static({urls:["/explorer"], root: require("nodules").getCachePath("persevere-client/") + "/explorer"}),
			// this will provide access to the server side JS libraries from the client
			require("transporter").Transporter({
				loader: require("nodules").forBrowser().useLocal().getModuleSource
			}),
			// main pintura app
			function(request){
				return pinturaApp(request);
			}
		])
	)
//)
);

// this is just to ensure the static analysis preloads the explorer package
false&&require("persevere-client/public/explorer/explorer.js");
