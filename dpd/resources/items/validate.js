var icItemConfig 	= require ('./public/ic-item-config.js')
	self			= this

icItemConfig.properties.forEach(function(property){
	var e = property.getErrors(self[property.name])

	if(e) error(property.name, e)
	
	if(self[property.name] && !property.mandatory) self[property.name] = property.defaultValue
})
