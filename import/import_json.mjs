import	{ default as mongodb 		}	from 'mongodb'
import	{ readFileSync				}	from 'fs'
import	{ fileURLToPath				}	from 'url'
import	{ getLocalDB				}	from '../connect_db.mjs'
import	path							from 'path'

const __dirname 		= path.dirname(fileURLToPath(import.meta.url))
const { MongoClient } 	= mongodb
const config			= JSON.parse(readFileSync(path.resolve(__dirname, '../config/config.json'), 'utf8'))
const db 				= await getLocalDB(config.db.port, config.db.name, config.db.credentials.username, config.db.credentials.password)

const json_file 		= process.argv[2]

const json = JSON.parse(readFileSync(path.resolve(json_file), 'utf8'))

if(json){
	 db.collection('items').insertMany(json)
	 .then(
	 	console.log,
	 	console.log
	 )
	 .then( 
	 	() => process.exit(0),
	 	() => process.exit(0)
	 )
}





