var icItemConfig    = require(process.cwd()+'/public/ic-item-config.js'),
	data			= ctx.body


if(

		!internal
	&&	!data.proposalFor //partial suggestions dont need to be validated at this point
	&&	!(me && me.privileges && me.privileges.indexOf('edit_items') != -1 && ctx.method == 'PUT')
){ 

	Object.entries(data).forEach( ([key,value]) => {
		const property = icItemConfig.properties.find( property => property.name == key)

		if(!property){

			error(
				key, 
				{
					message: 	"Unknown property: "+key,
					code:		"UNKNOWN_PROPERTY"
				}
			)

		} else{

			var e = property.getErrors(value)
        	if(e) error(key, e)

		}


	})

}
