import	{ default as mongodb 	}	from 'mongodb'

const 	{ MongoClient } = 	mongodb

export async function getLocalDB(port, name, user, pass, host){

	if(!port) throw "getLocalDB: missing port"
	if(!name) throw "getLocalDB: missing name"
	if(!user) throw "getLocalDB: missing user"
	if(!pass) throw "getLocalDB: missing pass"


	const 	connect_str	= `mongodb://${user}:${pass}@${host}:${port}/${name}`
	const parsedConnectionString = `mongodb://${user}:********@${host}:${port}/${name}`

	process.stdout.write(`Connecting to: ${parsedConnectionString} ...`)

	return await 	MongoClient.connect(connect_str, { 
							useNewUrlParser: 	true, 
							useUnifiedTopology:	true 
					})
					.then(
						client => {								
							process.stdout.write('[ok] \n\n')
							return client.db(name)
						},
						console.log
					)		

}
