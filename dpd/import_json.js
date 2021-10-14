process.chdir(__dirname)

const	path			=	require('path')
const	config			= 	JSON.parse(require('fs').readFileSync('../config/config.json'), 'utf8')
const	{readFileSync}	= 	require('fs')
const	deployd			= 	require('deployd')
const	json_file 		= 	process.argv[2]
const	server 			= 	deployd({
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
							})
const	internalClient 	= require('deployd/lib/internal-client')
const	json 			= JSON.parse(readFileSync(path.resolve(json_file), 'utf8'))



async function importJSON(dpd, import_json, clear_before_import){

	if(clear_before_import){

		console.log('Clearing items...')

		const current_items = await dpd.items.get()


		await 	Promise.all(current_items.map( item => dpd.items.del(item.id) ))
		
		console.log('Clearing items [done]')			
	}




	let to_import_items = import_json

	console.log('Importing '+to_import_items.length+' items...')

	await 	Promise.all(to_import_items.map( item => dpd.items.post(item) ))
		

	const items = await dpd.items.get()


	//TODO: generalize; dont use location_ref use itemConfig
	await 	Promise.all( items.map( item => {

				if(item.location_ref){
					const ref_by_title 	= items.find( i => i.title && icUtils.simplifyString(i.title) == icUtils.simplifyString(item.location_ref))
					const ref_by_id 	= items.find( i => i.id == item.location_ref)

					if(!ref_by_title && !ref_by_id) console.log('Bad location_ref ', item.location_ref)
					
					return 	ref_by_title
							?	dpd.items.put(item.id, {location_ref: (ref_by_title||{}).id || '' })
							:	Promise.resolve()
				}

				return Promise.resolve()
			}))

	console.log('Import: [ok]')

}





if(json){
	server.listen()

	server.on('listening', function() {

		const	dpd = internalClient.build(server)

		console.log(server)

		console.log(dpd)

		importJSON(dpd, json)
		.then(
			console.log,
			console.log
		)

	})
}

