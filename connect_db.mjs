import	{ default as mongodb 	}	from 'mongodb'

const 	{ MongoClient } = 	mongodb

export async function getLocalDB(host, port, name, user, pass){
	if(!port) throw "getLocalDB: missing port"
	if(!name) throw "getLocalDB: missing name"
	if(!host) throw "getLocalDB: missing host"
	if(!user) throw "getLocalDB: missing user"
	if(!pass) throw "getLocalDB: missing pass"

	const connectionString						= `mongodb://${user}:${pass}@${host}:${port}/${name}`
	const connectionStringWithPasswordHidden 	= `mongodb://${user}:********@${host}:${port}/${name}`

	process.stdout.write(`Connecting to: ${connectionStringWithPasswordHidden} ...`)

	return await 	MongoClient.connect(connectionString, { 
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
