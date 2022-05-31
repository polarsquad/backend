var Resource			= require('deployd/lib/resource'),
	Script 				= require('deployd/lib/script'),
	path 				= require('path'),
	util 				= require('util'),
	icUtils				= require(path.resolve('../ic-utils.js')),
	{config: icConfig}	= require(path.resolve('../config'))


function ActionResource() {
	Resource.apply(this, arguments)
}

util.inherits(ActionResource, Resource)

ActionResource.label = "Action"

ActionResource.events = ["updateTranslations", "translateItem", "exportItems"]

module.exports = ActionResource

ActionResource.prototype.clientGeneration = true

ActionResource.prototype.handle = function (ctx, next) {
	var parts = ctx.url.split('/').filter(function(p) { return p })

	var result = {}

	var domain = {
			url: 		ctx.url,
			parts: 		parts,
			query: 		ctx.query,
			body: 		ctx.body,
			config:		this.config,
			icConfig:	icConfig,
			icUtils:	icUtils,
			scriptPath:	path.resolve('.'),
			'this':		result,

			getHeader: function (name) {
				if (ctx.req.headers) {
						return ctx.req.headers[name]
				}
			},
			setHeader: function (name, value) {
				if (ctx.res.setHeader) {
						ctx.res.setHeader(name, value)
				}
			},
			setResult: function(val) {
				result = val
			}
	}

	//if (ctx.method != "POST") ctx.done("only POST allowed")

	var action = parts && parts[0]

	if(!action || !this.events[action]){
		ctx.done("unknown action")
		return null
	}

	this.events[action].run(ctx, domain,  function(err) {
		ctx.done(err, result)
	})

	//next()
}