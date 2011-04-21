/**
 * The starting point for Pintura running as a Jack app.
 */
var pinturaApp;
var File = require("file");
// HACK temporarily push nodules location
require.paths.unshift(File.resolve(File.cwd() + "/../nodules/lib"));
var nodules = require("nodules");
nodules.useLocal().ensure(["pintura/lib/pintura", "app", "tunguska/lib/jack-connector"], function(require){
	require.reloadable(function(){
		pinturaApp = require("pintura/lib/pintura").app;
		require("app");
	});
	require("tunguska/lib/jack-connector").observe("worker", pinturaApp.addConnection);
	// we start the REPL (the interactive JS console) because it is really helpful
	//if(require("jack/handler/simple-worker").options.firstWorker){
	//	require("narwhal/narwhal/repl").repl(true);
	//}
});

// FIXME
var Transporter = require("../transporter/lib/jsgi/transporter").Transporter;

var perseverePath;
var Cascade = require("jack/cascade").Cascade;
var Static = require("jack/static").Static;
var Directory = require("jack/dir").Directory; // FIXME

var path = require.paths[0].match(/(.*?)[\/\\]packages[\/\\]/);
if(path){
	perseverePath = path[1] + "/packages/persevere/public";
}

// now setup the development environment, handle static files before reloading the app
// for better performance
exports.app = exports.development = function(app, options){
	// make the root url redirect to /Page/Root  
	////return require("./lib/jsgi/redirect-root").RedirectRoot(
		return Cascade([
			// cascade from static to pintura REST handling
		    // the main place for static files accessible from the web
		    Directory("public", Static(null, {urls:[""], root: "public"})),
		    Static(null, {urls:["/explorer"], root: perseverePath + "/explorer"}),
		    // this will provide access to the server side JS libraries from the client
		    Transporter({loader: nodules.forEngine("browser").useLocal().getModuleSource}),
		    
		 	// main Pintura handler 
			function(request){
			    if (!pinturaApp) {
			        return {
			            status: 500,
			            headers: {},
			            body: ["Application is initializing..."]
			        };
			    }
			    return pinturaApp(request);
			}
		])
	////);
};
