var icItemConfig 	= require('./public/item_config.js'),
	fs				= require('fs')


//checking soundness of item config
icItemConfig.properties.forEach(function(property, index){
	if(!property.name) 			
		console.error('item_config: missing  name for property #'+index)

	if(['number', 'string', 'object', 'array', 'boolean'].indexOf(icItemConfig.utils.getType(property.defaultValue)) == -1)	
		console.error('item_config: missing or bad defaultValue for '+property.name)

	if(icItemConfig.utils.getType(property.validate) != 'function')
		console.warn('item_config: missing validation function for '+property.name)

})

var content = 	{
					"type": 		"Collection",
					"properties": 	icItemConfig.properties.reduce(function(properties, property, index){					

										properties[property.name] = {
											"name": 		property.name,
											"type": 		property.type,
											"typeLabel":	property.type,
											"required": 	false,
											"id": 			property.name,
											"order": 		index											
										}
										return 	properties
									},{})
				}

if(!fs.existsSync('resources/'+icItemConfig.collectionName)) fs.mkdir('resources/'+icItemConfig.collectionName)
fs.writeFileSync('resources/'+icItemConfig.collectionName+'/config.json', JSON.stringify(content, null, 4))
