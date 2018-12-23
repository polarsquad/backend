"use strict";

process.chdir(__dirname);

var	config			= 	JSON.parse(require('fs').readFileSync('../config/config.json', 'utf8')),
	deployd			= 	require('deployd'),
	server 			= 	deployd({
							port:	config.port,
							env: 	'production',
							db: {
								host: 	config.db.host,
								port: 	config.db.port,
								name: 	config.db.name,
								credentials: {
									username: config.db.credentials.username,
									password: config.db.credentials.password
								}
							}
						}),
	internalClient = require('deployd/lib/internal-client');

server.listen()

server.on('listening', function() {
	console.log("Server is listening on "+ config.port)

	var dpd = internalClient.build(server)

	dpd.actions.post('updateTranslations')
	.then(console.log, console.log)
})

server.on('error', function(err) {
	console.error(err)
	process.nextTick(function() { 
		process.exit()
	})
})