cancelUnless(
		internal
	|| 	(me && me.privileges && me.privileges.indexOf('edit_items') != -1), 
    "You are not authorized.", 401
)

var icItemConfig    = require (process.cwd()+'/public/ic-item-config.js'),
	self			= this,
    data            = ctx.body


icItemConfig.properties.forEach(function(property){
    if(!property.mandatory && data[property.name] === null) self[property.name] = undefined
})


this.lastEditDate   = new Date().getTime()
this.lastEditor     = me ? me.id : this.lastEditor