var fs = require('fs')

var config		= JSON.parse(fs.readFileSync('config/config.json')),
	key_path	= (process.argv[2] || '' ).split('.'),
	result		= ''

console.log(key_path.reduce( (obj, part) => obj && obj[part] || undefined, config))