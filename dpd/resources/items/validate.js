var icItemConfig    = require(process.cwd()+'/public/ic-item-config.js'),
	data			= ctx.body


if(

		!internal
	&&	!data.proposalFor //partial suggestions dont need to be validated at this point
	&&	!(me && me.privileges && me.privileges.indexOf('edit_items') != -1 && ctx.method == 'PUT')
){ 

    icItemConfig.properties.forEach(function(property){
        var e = property.getErrors(data[property.name])
        if(e) error(property.name, e)
    })
}
