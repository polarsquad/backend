'use strict'

var nodemailer  = require('nodemailer'),
	path		= require('path'),
	request		= require('request-promise'),
	Promise		= require('bluebird'),
	icConfig	= JSON.parse(require('fs').readFileSync(path.resolve('../config/config.json'), 'utf8')),
	itemConfig	= {}


try{
	itemConfig	= require(path.resolve('../dpd/public/ic-item-config.js'))
}
catch(e){
	console.error(e)
	console.log('Missing dpd/public/ic-item-config.js. Please run npm setup first.')
	process.exit(1)
}

exports.config = icConfig

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

exports.getGoogleTranslation = function(from, to, text){

	if(!icConfig.googleTranslateApiKey) Promise.reject('missing api key.')

	return 	Promise.resolve(request.get(
				'https://translation.googleapis.com/language/translate/v2', 
				{
					qs:{
						key:	icConfig.googleTranslateApiKey,
						q:		text,
						source:	from,
						target:	to
					},
					json: true
				}
			))
			.then( 	result 	=> result.data && result.data.translations && result.data.translations[0] && result.data.translations[0].translatedText)
			.then( 	text	=> text || Promise.reject('reponse yields no translation'))
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
	    console.log('Message %s sent: %s', info.messageId, info.response);
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


exports.mailSuggestion = function(to, suggestion, target){

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
		if(property.name in suggestion){
			if(property.name == 'state') 			return null
			if(property.name == 'proposalFor') 		return null
			if(property.name == 'creator') 			return null
			if(property.name == 'creationDate') 	return null
			if(property.name == 'lastEditor') 		return null
			if(property.name == 'lastEditDate') 	return null



			if(property.type != 'object'){
				if(target ? exports.diff(property, suggestion[property.name], target[property.name]) : !!suggestion[property.name]){
					content += property.name+': \t'	+ JSON.stringify(suggestion[property.name])	+ '\n'				
				}
			} else {
				if(!target || exports.diff(property, suggestion[property.name], target[property.name])){
					content += property.name+': \n'
				}

				for(var key in suggestion[property.name]){
					if(target ? exports.diff(property, suggestion[property.name], target[property.name], key) : !!suggestion[property.name][key]){
						content += "\t"+key+': \t'+ suggestion[property.name][key] + '\n'
					}
				}
			}
			
		}
	})

	exports.mail(to, subject, content)
}