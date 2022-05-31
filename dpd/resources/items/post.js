cancelUnless( 
		internal
	||  (me && me.privileges && me.privileges.includes('edit_items')) 
	||  this.state == 'suggestion', 
	"You are not authorized. Unregistered users can only submit suggestions.", 401
)

var {config} = require(process.cwd()+'/../config')
var icUtils = require(process.cwd()+'/../ic-utils.js'),
	self = this


const suggestionMeta = ctx && ctx.body.suggestionMeta || {}

delete this.suggestionMeta // this information must not enter the db


this.creationDate   = new Date().getTime()
this.creator        = me ? me.id : undefined

//proposal will allway be generated on get
delete this.proposals
delete this.apiKeyUsed


if(this.state == 'suggestion') {

	const sConfig 			= 	config.suggestions
	const apiKey			=	sConfig && sConfig.apiKey || undefined
	const sendConfirmation	= 	sConfig && sConfig.sendConfirmation && suggestionMeta.mail
	const requireApiKey		= 	this.proposalFor
								?	sConfig && ['edit', 'both', true].includes(sConfig.requireApiKey)
								:	sConfig && ['new', 	'both', true].includes(sConfig.requireApiKey)
	const requireMail		=	this.proposalFor
								?	sConfig && ['edit', 'both', true].includes(sConfig.requireMail)
								:	sConfig && ['new', 	'both', true].includes(sConfig.requireMail)								
	const requireName		=	this.proposalFor
								?	sConfig && ['edit', 'both', true].includes(sConfig.requireName)
								:	sConfig && ['new', 	'both', true].includes(sConfig.requireName)																

	if(requireApiKey 	&& !suggestionMeta.apiKey) 				cancel('Api key required for suggestions.', 401)
	if(requireApiKey	&&  suggestionMeta.apiKey != apiKey) 	cancel('Invalid suggestion api key.', 401)
	if(requireMail		&& !suggestionMeta.mail)				cancel(`Missing suggestion meta .mail: .suggestionMeta.mail`, 400)
	if(requireName		&& !suggestionMeta.name)				cancel(`Missing suggestion meta .name: .suggestionMeta.name`, 400)


	var next =  this.proposalFor
				?   dpd.items.get({id:this.proposalFor})
				:   Promise.resolve()
	

	if(suggestionMeta.apiKey == apiKey) this.apiKeyUsed = true

	if(suggestionMeta.apiKey && suggestionMeta.apiKey != apiKey){
		let value 

		try{		value = JSON.stringify(suggestionMeta.apiKey) }
		catch(e){ 	value = String(value) }

		icUtils.mailToAdmin(`Someone used a wrong apiKey: ${value}`)
	}
		
	next.then(function(target){
		dpd.users.get().then(function(users){

			const users_to_be_notified 	= users.filter( u => u.email && u.privileges.includes('be_notified_about_suggestions') )
			const emails				= users_to_be_notified.map( user => user.email).filter( x => !!x)	

			if(sendConfirmation){

				try 		{ icUtils.mailConfirmSuggestion(suggestionMeta, self, target, null, emails)  }
				catch(e)	{ console.error(e) }

			} else {

				emails.forEach( email => {				
					try 		{ icUtils.mailSuggestion(email, self, target)   }
					catch(e)    { console.error(e)}
				})
					
			}
		})    
	}, console.log)
}