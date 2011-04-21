/**
* Media handler for generating HTML from Wiki markup-based pages
*/

var Media = require("pintura/lib/media").Media;
var escapeHTML = require("commonjs-utils/lib/html").escape;
var wikiToHtml = require("wiky").toHtml;
	
require("pintura/lib/media/html").setupMediaHandler({
	defaultQuality:1, 
	createContext: function(object, mediaParams, request, response){
		return {
			pageName: escapeHTML(decodeURIComponent(request.pathInfo.replace(/^\/Page\//, ''))),
			content: (typeof object=='object')?wikiToHtml(object.content):"<p>"+object+"</p>",
			location: response.headers.location
		}
	}
});	
	
var rules = require("wiky").rules;
var store = require("wiky").store;
// add a rule for [[target page]] style links
rules.wikiinlines.push({ rex:/\[\[([^\]]*)\]\]/g, tmplt:function($0,$1,$2){return store("<a href=\""+$1+"\">"+$1+"</a>");}});
