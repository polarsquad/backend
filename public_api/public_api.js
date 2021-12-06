import	{ readFileSync				}	from 'fs'
import	{ default as express 		}	from 'express'
import	{ getLocalDB				}	from '../connect_db.mjs'
import	{ ItemImporter				}	from './items.js'
import	{ VoiceReader				}	from './voice-reader.js'
import	{ Translator				}	from './translations.js'
import	{ fileURLToPath				}	from 'url'
import	{ mailToAdmin				}	from '../ic-utils.js'

import	path							from 'path'

const __dirname 		=	path.dirname(fileURLToPath(import.meta.url))
const itemConfig		=	await import('./ic-item-config.cjs')
const config			=	JSON.parse(readFileSync(path.resolve(__dirname, '../config/config.json'), 'utf8'))
const db 				=	await getLocalDB(config.db.port, config.db.name, config.db.credentials.username, config.db.credentials.password)
const app				=	express()
const publicApiConfig	=	config.publicApi
const voiceReaderConfig	=	config.voiceReader
const translationKeys	=	(({googleTranslateApiKey, deepLApiKey}) => ({googleTranslateApiKey, deepLApiKey}))(config)

const translator		=	new Translator(db, translationKeys)

const itemImporter		=	new ItemImporter({
								db,
								publicApiConfig,
								translator,
								itemConfig
							})

const voiceReader		=	voiceReaderConfig && new VoiceReader({
								db,
								voiceReaderConfig,
								itemConfig
							})


function checkPublicApiConfig(config){

	Object.entries(config.remoteItems || {})
	.forEach( ([key, remoteItemConfig]) => {
		if(!remoteItemConfig.script) 			console.error(`Missing config.remoteItems.${key}.script 		(must be a filename)`)
		if(!remoteItemConfig.url) 				console.error(`Missing config.remoteItems.${key}.url			(must be a url)`)
		if(!remoteItemConfig.sourceName) 		console.error(`Missing config.remoteItems.${key}.sourceName		(must be a string)`)
		if(!remoteItemConfig.sourceUrl) 		console.error(`Missing config.remoteItems.${key}.sourceUrl		(must be a url)`)
		if(!remoteItemConfig.baseLanguage) 		console.warn(`Missing config.remoteItems.${key}.baseLanguage	(must be a string; de, en, fr ... )`)
		if(!remoteItemConfig.targetLanguages) 	console.warn(`Missing config.remoteItems.${key}.targetLanguages	(must be an Array; ['de', 'en', 'fr', ... ]`)

		if(remoteItemConfig.targetLanguages && !Array.isArray(remoteItemConfig.targetLanguages)) 
												console.error(`config.remoteItems.${key}.targetLanguages must be an Array; ['de', 'en', 'fr', ... ]`)

	})
}


function handle(fn){	
	return async (req, res, ...args) => {
		try{
			await fn(req, res, ...args)
		} catch(e) {
			console.log(e)
			mailToAdmin(e , config)
			res.status(500).send(e)
		}
	}
}


checkPublicApiConfig(publicApiConfig)

app.use(function(req, res, next) {
	res.header('Access-Control-Allow-Credentials', 	true)
	res.header('Access-Control-Allow-Origin', 		req.headers.origin)
	res.header('Access-Control-Allow-Methods', 		'GET, OPTIONS')
	res.header('Access-Control-Allow-Headers', 		'X-Requested-With, X-HTTP-Method-Override, Content-Type, Accept')
	next()		
})


app.get('/items', handle( async (req, res) => res.status(200).send( await itemImporter.getItems()  ) ) )


if(voiceReaderConfig){
	app.get('/voice-reader/html/:itemId/:lang',		handle( async (req,res)	=> 	res.status(200).send(await voiceReader.getHtmlToRead(req.params.itemId, req.params.lang) )))
	app.get('/voice-reader/audio/:itemId/:lang',	handle( async (req,res) => 	{
																					const itemId 			= req.params.itemId
																					const lang				= req.params.itemId
																					const {headers, blob} 	= await voiceReader.getAudio(`/voice-reader/html/${itemId}/${lang}`, lang)

																					Object.entries(headers).forEach( ([header, value]) =>  res.header(header, value) ) 

																					res.status(200)	
																					res.send(Buffer.from(await blob.arrayBuffer()))
																				}))
}

console.log('Listening on port', config.publicApi.port)

app.listen(config.publicApi.port)




