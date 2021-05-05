'use strict'

let nodemailer  = require('nodemailer'),
	path		= require('path'),
	request		= require('request-promise'),
	fetch		= require('node-fetch'),
	Promise		= require('bluebird'),
	icConfig	= {},
	itemConfig	= {},

	interfaceTranslationTable = {}


fetch.Promise = Promise

try{ 
	icConfig = JSON.parse(require('fs').readFileSync(path.resolve('../config/config.json'), 'utf8'))
}catch(e){
	console.log('Missing config file...')
}

try{
	itemConfig	= require(path.resolve('../dpd/public/ic-item-config.js'))
}
catch(e){
	console.log('Missing dpd/public/ic-item-config.js. Please run `npm run setup` first. \n\n')	
}



exports.config = icConfig

//replace with fetch:
exports.get = function(url){

	if(!url) console.error('utils.get: missing url')

	var http = url.startsWith('https') ? require('https') : require('http')

	return new Promise( (resolve, reject) => {
				
		var request = 	http.get(url,  response => {

							response.setEncoding('utf8')

							if(response.statusCode < 200 || response.statusCode > 299) {
								reject(new Error('Failed to load page, status code: ' + response.statusCode))
							}

							var body = [];

							response.on('data', (chunk) => body.push(chunk))
							response.on('end', () => resolve(JSON.parse(body.join(''))))
						})


		request.on('error', (err) => reject(err))

	})
}



exports.getTranslation = function(from, to ,text, config){

	if(from == 'none' || to == 'none') return Promise.resolve({message: "Language 'none' ignored."})
	if(from == to ) return Promise.resolve({message:"Source and target language cannot be the same."})
	if(!text) return Promise.resolve({message:"Missing text."})

	return 	Promise.reject()
			.catch( () => exports.getDeepLTranslation(from, to, text, config))
			.catch( () => exports.getGoogleTranslation(from, to, text, config))
}

exports.getGoogleTranslation = function(from, to, text, config){

	config = config || icConfig

	if(!config.googleTranslateApiKey) Promise.reject('missing google translation api key.')

	return 	Promise.resolve(request.get(
				'https://translation.googleapis.com/language/translate/v2', 
				{
					qs:{
						key:	config.googleTranslateApiKey,
						q:		text,
						source:	from,
						target:	to
					},
					json: true
				}
			))
			.catch( req => {

				console.log('GET failed: https://translation.googleapis.com/language/translate/v2')
				console.log(req.error)

				return Promise.reject(req)				

			})
			.then( 	result 	=> result.data && result.data.translations && result.data.translations[0] && result.data.translations[0].translatedText)
			.then( 	text	=> 	text
								?	{text, translator: 'Google Translate'}
								:	Promise.reject('Google Translate: reponse yields no translation'))
}

exports.getDeepLTranslation = function (from, to, text, config){
	
	config = config || icConfig

	console.log('Translating with deepL:', from, ' => ', to, '\"'+text.substr(0,20)+'\"\n')

	if(!config.deepLApiKey) Promise.reject('missing deepL api key.')

	return 	Promise.resolve(request.post(
				'https://api.deepl.com/v2/translate?auth_key='
				+ config.deepLApiKey
				+ '&text=' + encodeURIComponent(text)
				+ '&source_lang=' + from
				+ '&target_lang=' + to
			))
			.catch( req => {

				console.log('POST failed: https://api.deepl.com/v2/translate?auth_key')
				console.log(req.error)

				return Promise.reject(req)				

			})
			.then( 	json	=>	{ try{ return JSON.parse(json) } catch(e) { return Promise.reject(e) } })
			.then( 	result 	=> 	result && result.translations && result.translations[0] && result.translations[0].text)
			.then( 	text	=> 	text
								?	{text, translator: 'DeepL'}
								:	Promise.reject('DeepL: reponse yields no translation'))
}

exports.mail = function(to, subject, content){

	var transporter = nodemailer.createTransport({
		host: 	this.config.mail.host,
		port: 	this.config.mail.port,
		secure: this.config.mail.secure, 
		auth: 	{
					user: this.config.mail.user,
					pass: this.config.mail.pass
				}
	})

	var mailOptions = {
	    from: 		this.config.mail.from,
	    to: 		to, 
	    subject: 	subject, 
	    text: 		content
	};

	transporter.sendMail(mailOptions, (error, info) => {
	    if (error) {
	        return console.log(error);
	    }
	    console.log('Mail %s sent: %s', info.messageId, info.response);
	});
}


exports.diff = function(property, old_value, new_value, key){
	
	if(old_value == new_value) 			return false

	if(property.type == "string"){
		if(!old_value && !new_value)	return false
		return true
	}

	if(property.type == "number"){
		if(parseFloat(old_value) == parseFloat(new_value)) 					return false
		if(isNaN(parseFloat(old_value)) && isNaN(parseFloat(new_value))	) 	return false
		return true
	}

	if(property.type == "array"){
		if(!old_value && !new_value)				return false
		if(old_value.length != new_value.length)	return true

		if(old_value.some(function(x){ return new_value.indexOf(x) == -1} ))	return true
		if(new_value.some(function(y){ return old_value.indexOf(y) == -1} ))	return true

		return false
	}

	if(property.type == "object"){
		if(!old_value && !new_value)				return false

		for(var k in old_value){
			if( k == key || !key){
				if( (!!old_value[k] && old_value[k]) != (!!new_value[k] && new_value[k]) ) return true
			}
		}

		return false
	}
	
	return true
}


exports.mailSuggestion = function(to, suggestion, target, lang){

	lang = lang || 'DE'

	var subject = 	"Neuer Vorschlag eingegangen",
		link	= 	this.config.frontendUrl+"/item/"+(suggestion.proposalFor || suggestion.id),
		content	= 	suggestion.proposalFor
					?	"Der Änderungsvorschlag betrifft diesen Eintrag:\n\n"
					:	"Ein neuer Eintrag wurde vorgeschlagen:\n\n" 


	content += link + '\n\n'

	content += 	suggestion.proposalFor
				?	"Der Vorschlag enthält folgende Änderungen:\n\n"
				:	"Der Vorschlag enthält folgende Daten:\n\n"


	itemConfig.properties.forEach(function(property){

		if(!(property.name in suggestion)) 		return null
		if(property.internal) 					return null

		if(property.name == 'state') 			return null
		if(property.name == 'proposalFor') 		return null
		if(property.name == 'creator') 			return null
		if(property.name == 'creationDate') 	return null
		if(property.name == 'lastEditor') 		return null
		if(property.name == 'lastEditDate') 	return null


		//If there are no actual changes proposed:
		if( target 	&& !exports.diff(property, suggestion[property.name], target[property.name]) ) return null

		//If property is empty;	
		if( !target && !suggestion[property.name] )	 return null

		const translatedPropertyName = exports.getInterfaceTranslation(`ITEMS.${property.name}.${lang}`) || property.name


		content += `\n\n *${translatedPropertyName}*\n`


		if(property.translatable){

			Object.entries(suggestion[property.name]).forEach( ([key, value]) => {

				// no entries for this language:
				if(!target 	&& !suggestion[property.name][key].trim() ) return null

				//no updates for this language:
				if( target	&& !exports.diff(property, suggestion[property.name], target[property.name], key)  ) return null

				const translatedLanguagesName = exports.getInterfaceTranslation(`LANGUAGES.${key}.${lang}`) || lang

				content += `\t/${translatedLanguagesName}/ `

				content += `${value}\n`
			})

			content += '\n'


			return null
		} 



		if(property.type == 'array'){

			suggestion[property.name].forEach( value => {

				const translatedValue = 	exports.getInterfaceTranslation(`TYPES.${value}.${lang}`)
										||	exports.getInterfaceTranslation(`CATEGORIES.${value}.${lang}`) 
										||	exports.getInterfaceTranslation(`UNSORTED_TAGS.${value}.${lang}`)
										||	value

				content += `\t${translatedValue}\n`
			})

			return null
		}



		if(['string', 'number'].includes(property.type)){

			const translatedValue = 		exports.getInterfaceTranslation(`TYPES.${suggestion[property.name]}.${lang}`)
										||	exports.getInterfaceTranslation(`CATEGORIES.${suggestion[property.name]}.${lang}`) 
										||	exports.getInterfaceTranslation(`UNSORTED_TAGS.${suggestion[property.name]}.${lang}`)
										||	suggestion[property.name]


			content += `\t${translatedValue}\n`

			return null
		}

		
		content += `${translatedPropertyName}: \n\t ${JSON.stringify(suggestion[property.name])}\n`				

			
	})

	exports.mail(to, subject, content)
}

exports.fetchGoogleSheets = async function(sheet_id, api_key){

	const base		= 'https://sheets.googleapis.com/v4/spreadsheets'
	const url		= `${base}/${sheet_id}?key=${api_key}&includeGridData=true`

	const result	= await fetch(url)
	const data		= await result.json()

	const sheets	= data.sheets

	return sheets
}


exports.getEffectiveValues = function(sheet){

	const data 				= 	sheet.data[0]
	const rows				= 	data.rowData

	const effective_values	= 	rows.map(  

									rowData =>	(rowData.values || []).map( 

													value => {

														if(!value) 					return undefined
														if(!value.effectiveValue)	return undefined
														
														return  value.effectiveValue.stringValue
																|| 
																value.effectiveValue.numberValue
																||
																undefined 
													}
												)

								)
								.filter( row => row.some( value => value !== undefined) )
	return effective_values
}

exports.trimEffectiveValues = function(effective_values, skip_rows, skip_columns){

	skip_rows 		= skip_rows 	|| []
	skip_columns	= skip_columns 	|| []


	const rows					= 	effective_values
									.filter( 	(row, 		row_index) 		=> !skip_rows.includes(row_index))



	const column_count			= 	Math.max(...rows.map( row => row.length))

	const columns				= 	Array(column_count).fill(0)	
									.map( 		(x, 		column_index)	=> rows.map( row => row[column_index] ) )
									.filter( 	(column, 	column_index)	=> !skip_columns.includes(column_index) )

	const columns_value_count	= 	columns.map( column => column.filter( value => value != undefined).length)

	const trimmed_values		=	rows
									.map( 		row => row.filter( (column, column_index) => columns_value_count[column_index] > 0) )	
									.filter(	row => row.filter( value => value != undefined).length > 0)

	return trimmed_values

}

exports.evHashArray = function(effective_values, normalize_keys, ignore_empty_columns){


	const properties 	= 	effective_values[0]
	const data			= 	effective_values.slice(1)

	const hash_array	= 	data.map( row => 	row.reduce( (acc, value, index) => {

													if(!properties[index]) return acc

													const property_name = 	normalize_keys
																			?	properties[index].toUpperCase().replace(/\s/g, "_")
																			:	properties[index]

													if(property_name) acc[property_name] = value

													return acc

												}, {})
							)

	return hash_array

}

exports.evDictionary = function(effective_values, normalize_keys, ignore_empty_rows){	


	const rows			= 	ignore_empty_rows 
							?	effective_values.filter( 
									(row, index) => 
											row.slice(1).some(value => !!value) 
										&& 	(index == 0 ||row[0] )	// row for hash keys  has no frist entry, every other line should have at least one beyond the first element used as key 
								)
							:	effective_values

	const keys			= 	rows.slice(1).map( row => normalize_keys ? row[0].toUpperCase().replace(/\s/g, "_") :row[0] )			
	const data			= 	rows.map( row => row.slice(1) )
	const hashes		=	exports.evHashArray(data, true)

	const dictionary	= 	keys.reduce( (acc, key, index ) => {

								if(key) acc[key] = hashes[index]

								return	acc

							}, {})

	return dictionary
}




exports.splitSpreadsheetUrl = function(spreadsheetUrl){

	let match = spreadsheetUrl.match(/\/spreadsheets\/([^?]+)\?.*key=([^\&]+)/)	

	return match && match.slice(1,3)

}

exports.getInterfaceTranslation = function(str){

	const path = str.split('.').map(section => section.replace(/([a-z])([A-Z])/,'$1_$2').toUpperCase().replace(/\s/g, "_"))

	return path.reduce( (acc, section) => acc && acc[section] ,interfaceTranslationTable)
}

exports.updateInterfaceTranslations = async function(sheet_id, api_key) {

	const sheets 	= await exports.fetchGoogleSheets(sheet_id, api_key)
	const errors	= []

	if(!sheets || sheets.length == 0) throw "updateInterfaceTranslations: missing sheets."
	
	interfaceTranslationTable = {}

	sheets.forEach( sheet => {


		const title 		= sheet && sheet.properties && sheet.properties.title

		if(!title) throw "updateInterfaceTranslations: Missing sheet title."

		const section 		= title.toUpperCase().replace(/\s/g, "_")

		const values		= exports.getEffectiveValues(sheet)

		const dictionary	= exports.evDictionary(values, true, true)

		interfaceTranslationTable[section] = dictionary

	})	

	return interfaceTranslationTable
}

