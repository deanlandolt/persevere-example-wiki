/**
 * This is an example Wiki web application written on Pintura
 */
var pageFacets = require("./facet/page");
var pageChangeFacets = require("./facet/page-change");
var admins = require("commonjs-utils/lib/settings").security.admins;
var copy = require("commonjs-utils/lib/copy").copy;
var Restrictive = require("perstore/lib/facet").Restrictive;
var FileSystem = require("perstore/lib/store/filesystem").FileSystem;
var File = require("pintura/lib/media").getFileModel();
var Model = require("perstore/lib/model").Model;
var Notifying = require("perstore/lib/store/notifying").Notifying;
var pinturaConfig = require("pintura").config;
var User = pinturaConfig.security.getAuthenticationFacet();

// registers the HTML representation handler that generates HTML from wiki content
require("./media/wiki-html");
// Defines the data model for the given user by request
pinturaConfig.getDataModel = function(request){
	var user = request.remoteUser;
	if(user){
		if(admins.indexOf(user)>-1){
			return fullModel; // admin users can directly access the data model without facets
		}
		return userModel;
	}
	return publicModel;
}
// we can use the class model for RESTful creation of models
var ClassModel = Model(Notifying(require("perstore/lib/stores").DefaultStore()),{});
var fullModel = {
	Page: require("./model/page").Page,
	PageChange: require("./model/page-change").PageChange,	
	User: User,
	File: File,
	Class: ClassModel,
	Module: FileSystem({dataFolder:"../lib"})
};
// initialize the data model
require("perstore/lib/model").initializeRoot(fullModel);

// We can generate models from schemas stored in a store/model if we want
exports.DataModel = fullModel = require("perstore/lib/model").createModelsFromModel(ClassModel, fullModel);


// the data model for non-authenticated users
var publicModel = {
	Page: pageFacets.PublicFacet,
	PageChange: pageChangeFacets.PublicFacet,
	User: User,
	File: Restrictive(File),
	Class: Restrictive(ClassModel)
};

// the data model for authenticated users 
var userModel = copy(publicModel, {});
userModel.Page = pageFacets.UserFacet;

