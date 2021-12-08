import 	mongodb 			from 'mongodb'
import	fetch				from 'node-fetch'

const { ObjectId } = mongodb

export class VoiceReader {


	constructor({db, voiceReaderConfig, itemConfig}){

		if(!voiceReaderConfig)  					throw 'VoiceReader.constructor: missing voiceReaderConfig'
		if(!voiceReaderConfig.properties) 			throw 'VoiceReader.constructor: missing voiceReaderConfig.properties'	
		if(!voiceReaderConfig.properties.length) 	throw 'VoiceReader.constructor: voiceReaderConfig.properties must not be empty'	

		if(!voiceReaderConfig.baseUrl)				throw 'VoiceReader.constructor: missing voiceReaderConfig.baseUrl'

		this.db 				= db
		this.voiceReaderConfig 	= voiceReaderConfig
		this.itemConfig			= itemConfig


		this.voiceReaderConfig.properties = this.voiceReaderConfig.properties || ['description']



	}


	async getAudio(toReadUrl, lang){

		// check if content is available:

		const contentUrl = this.voiceReaderConfig.baseUrl+toReadUrl


		const content_response 	= await fetch(contentUrl)
		const text				= await content_response.text()

		if(!content_response.ok) 	throw `VoiceReader.getAudio() ${contentUrl}, status: ${content_response.status}.`
		if(!text) 					throw `VoiceReader.getAudio() ${contentUrl}, no content.`


		// content works, try read speaker:
	

		//LANG?? testen!!

		const customerId		= 	this.voiceReaderConfig.customerId

		const params			=	{
										lang: 			'de_de',
										url:			contentUrl,
										audioformat:	'mp3',
										customerid:		customerId,
										rsjs_ver:		'3.5.0_rev1632-wr',
										sync:			'wordsent',
									}
		const query_string		=	Object.entries(params)
									.map( ([key,value]) => `${key}=${encodeURI(value)}`)
									.join('&')
									
		//const audio_url			= 	`http://app-eu.readspeaker.com/cgi-bin/rsent?customerid=${}&lang=de_de&url=${encodeURI(contentUrl)}&rsjs_ver=3.5.0_rev1632-wr&synccontainer=rs:span&wrc=10140109&audioformat=${encodeURI(file_fromat)}&sync=wordsent`		



		const audio_url			= 	'http://app-eu.readspeaker.com/cgi-bin/rsent?'+query_string		
		const audio_response	= 	await fetch(audio_url)

		if(!audio_response.headers.get('content-type') ) 				throw "VoiceReader.getAudio() failed: "+audio_url+" "+(await audio_response.text() ) 
		if( audio_response.headers.get('content-type')!='audio/mpeg') 	throw "VoiceReader.getAudio() failed: "+audio_url+" "+(await audio_response.text() )

		return 	{	
					blob:		await audio_response.blob(),
					headers:	{
									'content-type': 'audio/mpeg',									
								}
				}

	}


	async getHtmlToRead(itemId, lang){


		const item =	await	this.db.collection('items')
								.findOne({_id: itemId})

		

		const text = 	this.itemConfig.properties.map( property => {

							if(!this.voiceReaderConfig.properties.includes(property.name) ) return null

							return 	property.translatable
									?	item[property.name][lang]
									:	item[property.name]
						})	
						.filter( x => !!x)				
						.join('\n<br/>\n')


		return	`<html><head></head><body><!-- RSPEAK_START -->\n${text}\n<!-- RSPEAK_STOP --></body></html>`


	}



}