"use strict";


process.chdir(__dirname);

var icUtils 		= 	require('../ic-utils.js'),
	config			= 	JSON.parse(require('fs').readFileSync('../config/config.json', 'utf8')),
	deployd			= 	require('deployd'),
	server 			= 	deployd({
							port:	config.port,
							env: 	'production',
							db: {
								host: 	config.db.host,
								port: 	config.db.port,
								name: 	config.db.name,
								credentials: {
									username: config.db.credentials.username,
									password: config.db.credentials.password
								}
							}
						}),
	internalClient	=	require('deployd/lib/internal-client')

server.listen()

server.on('listening', function() {
	console.log("Server is listening on "+ config.port)

	var dpd = internalClient.build(server)

	dpd.actions.post('updateTranslations')
	.then(console.log, console.log)

	resubmissionCheck(dpd)
	setInterval(resubmissionCheck, 1000*60*60*12, dpd)

})

server.on('error', function(err) {
	console.error(err)
	process.nextTick(function() { 
		process.exit()
	})
})




//ad hoc, todo extra script:
function resubmissionCheck(dpd){
	console.log('\n\nChecking resubmissions...\n')
	dpd.items
	.get({		
			$and: [
				{resubmissionDate:  {$exists: 	true} },
				{resubmissionDate:  {$ne: 		undefined} },
				{resubmissionDate:  {$ne:		null} },
				{resubmissionDate:  {$ne:		""} }
			]
	})
	.then( function(items) {
		try{
			var now			= Date.now(),
				due_items 	= []
			

			due_items = items.filter( function(item) {

				var resubmissionDate 	= new Date(item.resubmissionDate)
				console.log(item.title, item.id)
				console.log('\tresubmissionDate: ', item.resubmissionDate)
				console.log('\tDue: ', now > resubmissionDate)

				return now > resubmissionDate
			})

			if(due_items.length == 0){
				console.log("No resubmissions due.\n")
				return null
			}

			var subject = 	'Wiedervorlage von Einträgen',
				content	= 	"Folgende Einträg wurden zur Wiedervorlage markiert: \n\n"+
				 			due_items.map(function(item){ 
				 				return 	item.title+"\n"+
										config.frontendUrl+"/item/"+item.id
										+"\n"
				 			}).join("\n")
							

			dpd.users.get({
				privileges: 'be_notified_about_suggestions'
			})
			.then(function(users){
				users.forEach( function(user){
					if(user.email){
						try{ icUtils.mail(user.email, subject, content) } 
						catch(e){ console.error(e) }
					}
				})
				
				due_items.forEach(function(item){
					dpd.items.put(item.id, {resubmissionDate: null })
				})
			})

		} catch(e){
			console.log(e)
		}
			
	}, console.log)	
}