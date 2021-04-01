import	{ readFileSync				}	from 'fs'
import	{ default as express 		}	from 'express'
import	{ getLocalDB				}	from '../connect_db.mjs'
import	{ ItemImporter				}	from './items.js'
import	{ Translator				}	from './translations.js'
import	{ fileURLToPath				}	from 'url'

import	path							from 'path'

const __dirname 		=	path.dirname(fileURLToPath(import.meta.url))
const itemConfig		=	await import('./ic-item-config.cjs')
const config			=	JSON.parse(readFileSync(path.resolve(__dirname, '../config/config.json'), 'utf8'))
const db 				=	await getLocalDB(config.db.port, config.db.name, config.db.credentials.username, config.db.credentials.password)
const app				=	express()
const publicApiConfig	=	config.publicApi
const translationKeys	=	(({googleTranslateApiKey, deepLApiKey}) => ({googleTranslateApiKey, deepLApiKey}))(config)

const translator		=	new Translator(db, translationKeys)

const itemImporter		=	new ItemImporter({
								db,
								publicApiConfig,
								translator,
								itemConfig
							})


function handle(fn, ...params){
	return async (req, res) => {
		try{
			res.send(await fn(...params))
		} catch(e) {
			console.log(e)
			res.status(500).send(e)
		}
	}
}

app.use(function(req, res, next) {
	res.header('Access-Control-Allow-Credentials', 	true)
	res.header('Access-Control-Allow-Origin', 		req.headers.origin)
	res.header('Access-Control-Allow-Methods', 		'GET, OPTIONS')
	res.header('Access-Control-Allow-Headers', 		'X-Requested-With, X-HTTP-Method-Override, Content-Type, Accept')
	next()		
})


if(config.publicApi){
	app.get('/items', handle( () => itemImporter.getItems()  ) )
}

console.log('Listening on port', config.publicApi.port)

app.listen(config.publicApi.port)




