import	{ default as mongodb 	}	from 'mongodb'

const 	{ MongoClient } = 	mongodb

export async function getLocalDB(port, name, user, pass){

	if(!port) throw "getLocalDB: missing port"
	if(!name) throw "getLocalDB: missing name"
	if(!user) throw "getLocalDB: missing user"
	if(!pass) throw "getLocalDB: missing pass"


	const 	connect_str	= `mongodb://${user}:${pass}@127.0.0.1:${port}/${name}`

	process.stdout.write('\nConnecting to: '+connect_str+' ... ')

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
