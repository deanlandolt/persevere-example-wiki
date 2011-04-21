var redirector = require("commonjs-utils/lib/jsgi/redirect").Redirect("/Page/Example");

exports.RedirectRoot = function(app){
	return function(request){
		if(request.pathInfo == "/"){
			return redirector(request);
		}
		return app(request);
	};
};