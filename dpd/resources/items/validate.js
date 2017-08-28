var icItemConfig    = require ('./public/ic-item-config.js'),
	data			= ctx.body



if(!data.proposalFor){ //partial suggestions dont need to be validated at this point

    icItemConfig.properties.forEach(function(property){
        var e = property.getErrors(data[property.name])
        if(e) error(property.name, e)
    })
}
