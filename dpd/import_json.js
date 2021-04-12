process.chdir(__dirname)

const	path			=	require('path')
const	config			= 	JSON.parse(require('fs').readFileSync('../config/config.json'), 'utf8')
const	{readFileSync}	= 	require('fs')
const	deployd			= 	require('deployd')
const	json_file 		= 	process.argv[2]
const	server 			= 	deployd({
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
							})
const	internalClient 	= require('deployd/lib/internal-client')
const	json 			= JSON.parse(readFileSync(path.resolve(json_file), 'utf8'))


if(json){
	server.listen()

	server.on('listening', function() {

		const	dpd = internalClient.build(server)

		console.log(server)

		console.log(dpd)

		Promise.all(json.map( item => {
			dpd.items.post(item)
		}))
		.then(
			console.log,
			console.log
		)

	})
}

