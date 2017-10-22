var	config	= 	JSON.parse(require('fs').readFileSync('../config/config.json', 'utf8'))
	deployd	= 	require('deployd')
	server 	= 	deployd({
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

server.listen()

server.on('listening', function() {
	console.log("Server is listening")
})

server.on('error', function(err) {
	console.error(err)
	process.nextTick(function() { 
		process.exit()
	})
})


db.createUser(
  {
    user: 	"deployd",
    pwd: 	"ooy8teachei5Aiphae8Y",
    roles: [ 
    	{ role: "readWrite", db: "-deployd" },
    ]
  }
)
