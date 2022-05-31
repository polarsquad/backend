import	{ default as express 		}	from 'express'
import	{ getLocalDB				}	from '../connect_db.mjs'
import	{ ItemImporter				}	from './items.js'
import	{ VoiceReader				}	from './voice-reader.js'
import	{ ItemExporter				}	from './export.js'
import	{ Translator				}	from './translations.js'
import	{ fileURLToPath				}	from 'url'
import  { config                    }	from '../config/index.js'

import	icUtils							from '../ic-utils.js'
import	path							from 'path'
import	bodyParser 						from 'body-parser'

const { mailToAdmin }	=	icUtils


const __dirname 		=	path.dirname(fileURLToPath(import.meta.url))
const itemConfig		=	await import('./ic-item-config.cjs')
const db 				=	await getLocalDB(config.db.port, config.db.name, config.db.credentials.username, config.db.credentials.password, config.db.host)
const app				=	express()
const jsonParser 		=	bodyParser.json()
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

const itemExporter		=	new ItemExporter({
								db,
								config
							})

const voiceReader		=	voiceReaderConfig && new VoiceReader({
								db,
								voiceReaderConfig,
								itemConfig
							})


const force_remote_item_update = 	!!process.argv.find( arg => arg.match(/--force-remote-item-update/) )


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
			console.log('STACK', e.stack)
			mailToAdmin(e.stack , config)
			res.status(500).send(e)
		}
	}
}


checkPublicApiConfig(publicApiConfig)

app.use(function(req, res, next) {
	res.header('Access-Control-Allow-Credentials', 	true)
	res.header('Access-Control-Allow-Origin', 		req.headers.origin)
	res.header('Access-Control-Allow-Methods', 		'GET, OPTIONS, POST')
	res.header('Access-Control-Allow-Headers', 		'X-Requested-With, X-HTTP-Method-Override, Content-Type, Accept')
	next()		
})

app.get('/items', 					handle( async (req, res) => res.status(200).send( await itemImporter.getItems(force_remote_item_update)  ) ) )


app.post('/items/export/:lang/csv', jsonParser,	
									handle( async (req, res) => {
										res.setHeader('Content-Type', 'plain/text; charset=utf-8')
										const path = req.originalUrl
										await itemExporter.storeCsvFile(__dirname, req.params.lang, req.body || {})
										res.status(200).send(`GET ${path}`) 	
									}))

app.get('/items/export/:lang/csv', handle( async (req, res) => {
										res.setHeader('Content-Type', 'text/csv; charset=utf-8')
										res.setHeader('content-disposition', "attachment; filename=\"" + itemExporter.getCsvFilename(req.params.lang) )
										res.status(200).send (await itemExporter.getCsvFile(__dirname, req.params.lang) )	
									}))

if(voiceReaderConfig){
	app.get('/voice-reader/:itemId/html/:lang',		handle( async (req,res)	=> 	res.status(200).send(await voiceReader.getHtmlToRead(req.params.itemId, req.params.lang) )))
	app.get('/voice-reader/:itemId/audio/:lang',	handle( async (req,res) => 	{

														const itemId 			= req.params.itemId
														const lang				= req.params.lang
														const {headers, blob} 	= await voiceReader.getAudio(`/voice-reader/${itemId}/html/${lang}`, lang)

														Object.entries(headers).forEach( ([header, value]) =>  res.header(header, value) ) 

														res.status(200)	
														res.send(Buffer.from(await blob.arrayBuffer()))
													}))
}

console.log('Listening on port', config.publicApi.port)

app.listen(config.publicApi.port)




