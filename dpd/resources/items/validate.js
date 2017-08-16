var icItemConfig    = require ('./public/ic-item-config.js'),
	self			= this

console.log('validate', !self.proposalFor)
if(!self.proposalFor){ //partial suggestions dont need to be validated at this point

    icItemConfig.properties.forEach(function(property){
        var e = property.getErrors(self[property.name])
        if(e) error(property.name, e)
    })
}
