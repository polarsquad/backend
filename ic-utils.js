'use strict'

const nodemailer  	= require('nodemailer')
const path			= require('path')
const request		= require('request-promise')
const fetch			= require('node-fetch')
const Promise		= require('bluebird')
const fs 			= require('fs')
const {config}		= require('./config/index.js')

let	adminMessages 		= []
let	lastAdminMessage	= undefined

fetch.Promise = Promise

// Config file
let	icConfig		= config
exports.config = icConfig

// IC Item Config
let	itemConfig		= undefined
const icItemConfigRelativePath = "dpd/public/ic-item-config.js"
for (const start of ['..', __dirname]) {
	const icItemConfigAbsolutePath = path.resolve(`${start}/${icItemConfigRelativePath}`)
	if (fs.existsSync(icItemConfigAbsolutePath)) {
		itemConfig	= require(icItemConfigAbsolutePath)
		console.log('found', `${start}/${icItemConfigRelativePath}`)		
		break;
	}
}

if (!itemConfig) {
	console.log(`Missing itemConfig at "${icItemConfigRelativePath}". Please run 'npm run setup' first. \n\n`)	
	itemConfig = {}
}

exports.itemConfig = itemConfig

// Translations
let	interfaceTranslationTable = undefined
const translationsRelativePath = "dpd/public/translations.json"
try {
	for (const start of ['..', __dirname]) {
		const translationsAbsolutePath = path.resolve(`${start}/${translationsRelativePath}`)
		if (fs.existsSync(translationsAbsolutePath)) {
			interfaceTranslationTable	= JSON.parse(fs.readFileSync(translationsAbsolutePath, 'utf8') )
			console.log('found', `${start}/${translationsRelativePath}`)
			break;				
		}
	}
} catch (error) {
	console.log(`Unable to parse translation file... at ${translationsRelativePath}`) 
}

if (!interfaceTranslationTable) {
	console.log(`Unable to parse translation file... at ${translationsRelativePath}`) 
	interfaceTranslationTable = {}
}

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

	config = config || icConfig

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

				console.log('GET failed: https://translation.googleapis.com/language/translate/v2', req.statusCode, text.slice(0,100))

				return Promise.reject('googleTranslate failed.')				

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

				console.log('POST failed: https://api.deepl.com/v2/translate?auth_key', req.statusCode, text.slice(0,100))

				return Promise.reject('DeepL failed.')				

			})
			.then( 	json	=>	{ try{ return JSON.parse(json) } catch(e) { return Promise.reject(e) } })
			.then( 	result 	=> 	result && result.translations && result.translations[0] && result.translations[0].text)
			.then( 	text	=> 	text
								?	{text, translator: 'DeepL'}
								:	Promise.reject('DeepL: reponse yields no translation'))
}

exports.mail = async function(to, subject, content, config, bcc){

	bcc = bcc || []

	if(typeof bcc == 'string') bcc = [bcc]

	config = config || icConfig

	var transporter = nodemailer.createTransport({
		host: 	config.mail.host,
		port: 	config.mail.port,
		secure: config.mail.secure, 
		auth: 	{
					user: config.mail.user,
					pass: config.mail.pass
				}
	})

	var mailOptions = {
	    from: 		config.mail.from || 'info@place-making.org',
	    to: 		to,
	    bcc:		bcc, 
	    subject: 	subject, 
	    text: 		content
	}

	try{
		await transporter.sendMail(mailOptions)
		console.log(`Mail with subject '${subject}' sent to: ${to}, bcc: ${bcc.join(', ')}`)
	} catch(e) {
		console.log('icUtils.mail: failed to send massage.', e, mailOptions)
	}
}


exports.mailToAdmin = async function(content, config){

	config = config || icConfig

	if(!config.adminMail){
		console.error('mailToAdmin: missing config.adminMail')
		return null
	}

	content && adminMessages.push(content)

	const delay = 1000 * 60 * 10 // 10 minutes

	if(lastAdminMessage - Date.now() < delay) {		
		setTimeout( () => exports.mailToAdmin(null, config), delay + 1)
		return null
	}

	lastAdminMessage = Date.now()

	const adminMails = 	Array.isArray(config.adminMail)
	 					?	config.adminMail
	 					:	[config.adminMail]

	await 	Promise.any( adminMails.map( 
				email 	=> 	exports.mail(
								email, 
								`InfoCompass Error(s) [${adminMessages.length}]: `+config.title, 
								adminMessages
								.map( (content, index) => `**(${index})**:\n ${content}`)
								.join('\n\n'),
								config 
							)
			))

	adminMessages = []
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

exports.mailBodyChanges = function(suggestion, target, lang){

	lang = lang || 'DE'

	let content = ''

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

		const translatedPropertyName = exports.getInterfaceTranslation(`ITEMS.${property.name}`,lang) || property.name


		content += `\n\n *${translatedPropertyName}*\n`


		if(property.translatable){

			Object.entries(suggestion[property.name]).forEach( ([key, value]) => {

				// no entries for this language:
				if(!target 	&& !suggestion[property.name][key].trim() ) return null

				//no updates for this language:
				if( target	&& !exports.diff(property, suggestion[property.name], target[property.name], key)  ) return null

				const translatedLanguagesName = exports.getInterfaceTranslation(`LANGUAGES.${key}`,lang) || lang

				content += `\t/${translatedLanguagesName}/ `

				content += `${value}\n`
			})

			content += '\n'


			return null
		} 



		if(property.type == 'array'){

			suggestion[property.name].forEach( value => {

				const translatedValue = 	exports.getInterfaceTranslation(`TYPES.${value}`,lang)
										||	exports.getInterfaceTranslation(`CATEGORIES.${value}`,lang) 
										||	exports.getInterfaceTranslation(`UNSORTED_TAGS.${value}`,lang)
										||	value

				content += `\t${translatedValue}\n`
			})

			return null
		}



		if(['string', 'number'].includes(property.type)){

			const translatedValue = 		exports.getInterfaceTranslation(`TYPES.${suggestion[property.name]}`,lang)
										||	exports.getInterfaceTranslation(`CATEGORIES.${suggestion[property.name]}`,lang) 
										||	exports.getInterfaceTranslation(`UNSORTED_TAGS.${suggestion[property.name]}`,lang)
										||	suggestion[property.name]


			content += `\t${translatedValue}\n`

			return null
		}

		
		content += `${translatedPropertyName}: \n\t ${JSON.stringify(suggestion[property.name])}\n`				

			
	})

	return content

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


	content += exports.mailBodyChanges(suggestion, target, lang)

	exports.mail(to, subject, content)

	console.log('mailTo', to, subject, content)
}

exports.mailConfirmSuggestion = function(to_or_meta, suggestion, target, lang, bcc){

	lang = lang || 'DE'

	const suggestionMeta 	= 	typeof to_or_meta == 'string'
								?	{ mail : to_or_meta }
								:	to_or_meta || {}

	const fullTo			=	`${suggestionMeta.name}<${suggestionMeta.mail}>`
	const auth				=	suggestionMeta.apiKey == icConfig.suggestions.apiKey

	var subject = 	`${exports.getInterfaceTranslation(`EMAIL.CONFIRMATION_SUBJECT`,lang, true)} (${this.config.title})`+(auth ? ' [auth]' : ''),
		link	= 	this.config.frontendUrl+"/item/"+(suggestion.proposalFor || suggestion.id),
		content	= 	''	


	content	+=	`${exports.getInterfaceTranslation(`EMAIL.CONFIRMATION_INTRO`,lang, true)} \n\n`.replace('%s', suggestionMeta.name || suggestionMeta.mail )

	content	+= 	suggestion.proposalFor
					?	`${exports.getInterfaceTranslation(`EMAIL.CONFIRMATION_LINK_EDIT`,lang, true)}\n\n`
					:	`${exports.getInterfaceTranslation(`EMAIL.CONFIRMATION_LINK_NEW`,lang, true)}\n\n`

	content +=	link + '\n\n'

	content += `${exports.getInterfaceTranslation(`EMAIL.CONFIRMATION_AUTHOR`,lang, true)} \n\n`.replace('%s', fullTo )

	content += 	`${exports.getInterfaceTranslation(`EMAIL.CONFIRMATION_DSGVO`,lang, true)}\n\n`
					

	content += 	suggestion.proposalFor
				?	`${exports.getInterfaceTranslation(`EMAIL.CONFIRMATION_DATA_EDIT`,lang, true)}\n\n`
				:	`${exports.getInterfaceTranslation(`EMAIL.CONFIRMATION_DATA_NEW`,lang, true)}\n\n`


	content += exports.mailBodyChanges(suggestion, target, lang)

	exports.mail(fullTo, subject, content, undefined, bcc)

}



exports.fetchGoogleSheets = async function(sheet_id, api_key){

	const base		= 'https://sheets.googleapis.com/v4/spreadsheets'
	const url		= `${base}/${sheet_id}?key=${api_key}&includeGridData=true`

	const result	= await fetch(url)
	const data		= await result.json()

	const sheets	= data.sheets

	if(!sheets){
		console.log('fetchGoogleSheets():')
		console.log('\tfetch result:\t', result)		
	}

	return sheets
}


exports.getEffectiveValues = function(sheet){

	const data 				= 	sheet.data[0]
	const rows				= 	data.rowData

	const effective_values	= 	rows.map(  

									rowData =>	(rowData.values||[]).map( 

													value => {

														if(!value) 					return ""
														if(!value.effectiveValue)	return ""
														
														return  value.effectiveValue.stringValue
																|| 
																value.effectiveValue.numberValue
																||
																""
													}
												)

								)
								.filter( row => row.some( value => !!value) )
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

exports.getInterfaceTranslation = function(str, lang, return_missing_key){

	lang = lang && lang.toUpperCase()

	const path = str.split('.').map(section => section.replace(/([a-z])([A-Z])/,'$1_$2').toUpperCase().replace(/\s/g, "_"))

	return path.reduce( (acc, section) => acc && acc[section] ,interfaceTranslationTable[lang]) || (return_missing_key ? str : undefined)
}

exports.updateInterfaceTranslations = async function(sheet_id, api_key) {

	const sheets 	= await exports.fetchGoogleSheets(sheet_id, api_key)
	const errors	= []

	if(!sheets || sheets.length == 0){
		console.log('updateInterfaceTranslations():')
		console.log('\t sheet_id:\t', sheet_id)		
		console.log('\t sheets:\t', sheets)		

		throw "updateInterfaceTranslations: missing sheets."
	}
	
	interfaceTranslationTable = {}

	sheets.forEach( sheet => {
		const title 		= sheet && sheet.properties && sheet.properties.title

		if(!title) throw "updateInterfaceTranslations: Missing sheet title."

		const section 		= title.toUpperCase().replace(/\s/g, "_")

		const values		= exports.getEffectiveValues(sheet)

		const dictionary	= exports.evDictionary(values, true, false)

		Object.entries(dictionary).forEach( ([str, dic]) => {			
			Object.entries(dic).forEach( ([lang, value])=> {
				interfaceTranslationTable[lang] 				= interfaceTranslationTable[lang] || {}
				interfaceTranslationTable[lang][section]		= interfaceTranslationTable[lang][section] || {}
				interfaceTranslationTable[lang][section][str] 	= value || ""
			})
		})


	})	

	return interfaceTranslationTable
}

exports.simplifyString = function (str){

	if(!str) return undefined

	return 	str
			.toLowerCase()
			.replace(/ß/g, 'ss')
			.replace(/(ü|ü)/g, 'ue')
			.replace(/(ö|ö)/g, 'oe')
			.replace(/ä/g, 'ae')
			.replace(/[^a-zA-Z]/g,'')
}


