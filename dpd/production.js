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
	console.log('checking resubmissions...')
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
			var now	= Date.now()

			console.log('now:', now, items.length)

			items.forEach( function(item) {

				var resubmissionDate 	= new Date(item.resubmissionDate)
				console.log(item.title, item.id)
				console.log('\tresubmissionDate: ', item.resubmissionDate, resubmissionDate)
				console.log('\tdue: ', now > resubmissionDate)

				if(now > resubmissionDate){
					dpd.items.put(item.id, {resubmissionDate: "" })
					icUtils.mail(
						'andreas.pittrich@posteo.de', 
						'Wiedervorlage Eintrag: '+item.title, 

						"Folgender Eintrag wurde zur Wiedervorlage markiert: \n\n"+
						item.title+"\n"+
						config.frontendUrl+"/item/"+item.id
					)
				}
			})
		} catch(e){
			console.log(e)
		}
			
	}, console.log)
}