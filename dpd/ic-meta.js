'use strict'

var Resource	= require('deployd/lib/resource'),
	util		= require('util'),
	fs			= require('fs'),
	ejs			= require('ejs'),
	path 		= require('path'),
	icUtils		= require(path.resolve('../ic-utils.js'))


function Meta(name, options) {
	Resource.apply(this, arguments);
}

util.inherits(Meta, Resource);
module.exports = Meta;


Meta.basicDashboard = {
	settings: [
		{
			name: 			'linkedCollection',
			type: 			'text',
			description: 	'Metadata for items of this collections.'
		},
		{
			name: 			'defaultLanguageCode',
			type: 			'text',
			description: 	'Default language code if none is provided.'
		}
	]
}

Meta.prototype.handle = function (ctx, next) {

	if(ctx.req && ctx.req.method !== 'GET') return ctx.done("Only GET allowed.");

	var parts 	= ctx.url.split('/').filter(function(p) { return p }),
		id		= parts && parts[0],
		lang	= parts && parts[1] || this.config.defaultLanguageCode || 'en',
		self	= this


	try {
		if(id && this.config.linkedCollection && ctx.dpd[this.config.linkedCollection]){
			ctx.dpd[this.config.linkedCollection].get(id)
			.then(
				function(data){
					console.log(data)
					fs.readFile(self.options.configPath+'/template.html', {encoding: 'utf-8'}, function(error, template) {
						if(error){
							ctx.res.statusCode = 500
							console.trace(error)
							return ctx.done('internal server error')
						}

						var html = ejs.render(template, {
										title:			(data.title	|| '').replace('"', "'"),
										image:			(data.image	|| '').replace('"', "'"),
										description:	(data.description[lang] || data.description[lang] || '').replace('"', "'"),
										twitter:		data.twitter,
										url:			icUtils.config.frontendUrl+'/item/' + id + '/l/' + lang,
										site: {
											title:		(icUtils.config.title	|| '').replace('"', "'"),
											twitter:	(icUtils.config.twitter	|| '').replace('"', "'"),
										}
									});
						ctx.done(null, html);
					})
				},
				function(e){
					ctx.res.statusCode = 404
					ctx.done('not found')
				}
			)
		} else {
			console.log('Meta: bad config.')
			ctx.done()
		}
	} catch (ex) {
		console.log(ex);
	}
}