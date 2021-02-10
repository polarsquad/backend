"use strict";
var	fs				= require('fs'),
	icItemConfig	= require (process.cwd()+'/public/ic-item-config.js'),
	json_file		= process.argv[2] || console.error('missing JSON file'),
	data			= json_file && JSON.parse(fs.readFileSync(process.argv[2], 'utf8')),
	valid_data		= []

console.log('Number of items:'+ data.length)

data.forEach( (item, index) => {
	if(icItemConfig.properties.every(property => {
        var e = property.getErrors(item[property.name])
        if(e) {
        	console.log('-------------------')
        	console.log(index, item.title)
        	console.log('Property:', property.name)
        	console.log(e)
        	console.log(item[property.name])
        	console.log('-------------------')
        	return false
        }
        return true
    }))  valid_data.push(item)
})


if(process.argv[2]) fs.writeFileSync('valid_data.json', JSON.stringify(valid_data, null, 4), 'utf8')
