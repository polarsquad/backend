"use strict";
var	fs				= require('fs'),
	icItemConfig	= require (process.cwd()+'/public/ic-item-config.js'),
	json_file		= process.argv[2] || console.error('missing JSON file'),
	data			= json_file && JSON.parse(fs.readFileSync(process.argv[2], 'utf8'))

console.log('Nuber of items:'+ data.length)

data.forEach( (item, index) => {
	icItemConfig.properties.forEach(property => {
        var e = property.getErrors(item[property.name])
        if(e) {
        	console.log('-------------------')
        	console.log(index, item.title)
        	console.log('Property:', property.name)
        	console.log(e)
        	console.log(item[property.name])
        	console.log('-------------------')
        }
    })
})
