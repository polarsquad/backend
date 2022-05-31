"use strict";

process.chdir(__dirname);

var	{config}	= 	require(path.resolve('../config')),
	deployd		= 	require('deployd'),
	server 		= 	deployd({
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
	internalClient 	= require('deployd/lib/internal-client'),
	fs 				= require ('fs'),
	request			= require('request-promise'),
	full_items 		= []


function delay(t) {
   return new Promise(function(resolve) { 
       setTimeout(resolve, t)
   })
}




server.listen()

server.on('listening', function() {
	console.log("Server is listening")
	var dpd = internalClient.build(process.server);

	var topic_map =	{
						'information': 	'information_counseling'
					}

  	
	request.get('http://213.187.84.22:3000/items?limit=10000&offset=0', {json:true})
	.then( result 	=> result.items.map(item => item.id))
	.then( ids		=> {

		var chain 		= Promise.resolve()

		ids.forEach( (id, index) => {
			chain = chain.then( () => {
				//console.log('\n\nGetting '+(index+1)+'/'+ids.length, '#'+id+' ...')
				return 	delay(0)
						.then( () 		=> 	request.get('http://213.187.84.22:3000/items/'+id, {json:true}))
						.then( result	=>  result.item)
						.then( item		=> 	{
												var last_change = new Date(item.meta.last_edit_on),
													now			= Date.now(),
													diff		= (now-last_change)/(1000*60*60*24) 

												if(diff <= 5){
													console.log(Math.floor(diff), item.id, item.title)
												}

												return Promise.resolve()


												item.topics && item.topics.forEach(function(topic,index){
													if(topic in topic_map){
														item.topics[index] = topic_map[topic]
														console.log('## replaced topic: ', topic, ' ==> ', topic_map[topic])
													}
												})


												return 	dpd.items.get( {legacyId: item.id} )
														// .then(
														// 	items	=> (items[0] ? ( console.log('overwrite...') || dpd.items.del(items[0].id) ) : null),	
														// 	() 		=> null
														// )
														.then( () => {
															item.primary_topic = topic_map[item.primary_topic] || item.primary_topic

															var new_item = {
																				title:				item.title,
																				image:				item.image_url,
																				state:				{'published': 'public', 'suggestion': 'suggestion', 'archived': 'archived', 'draft': 'darft' }[item.status],
																				tags:				[...item.topics, ...item.target_groups, {'places': 'location', 'events': 'event', 'services': 'service', 'information': 'information'}[item.type]],
																				primaryTopic:		item.primary_topic,
																				brief:				item.definitions,
																				description:		item.descriptions_full,
																				location:			'',
																				address:			item.address && (item.address.length <= 3 ? '' : item.address),
																				zip:				item.zip_code,
																				city:				item.place,
																				latitude:			item.latitude,
																				longitude:			item.longitude,
																				website:			item.website && (item.website.match(/^http/) ? item.website : 'http:/'+item.website),
																				email:				item.email,
																				facebook:			item.facebook,
																				twitter:			item.twitter,
																				whatsapp:			item.whatsapp,
																				contact:			item.name,
																				phone:				item.phone,
																				mobile:				'',
																				editingNote:		item.comment,
																				startDate:			item.start_date,
																				endDate:			item.end_date,
																				maxParticipants:	item.max_participants,
																				fees:				item.price,
																				hours:				item.times,
																				legacyId:			item.id,
																				proposalFor:		null,
																				creationDate:		null,
																				creator:			null,
																				lastEditDate:		null,
																				lastEditor:			null
																			}

															if(item.primary_topic && new_item.tags.indexOf(item.primary_topic) == -1)  new_item.tags.push(item.primary_topic)

															console.log('no POST')
															//dpd.items.post(new_item)
														})
														.then(
															()	=> console.log('\t done.'),
															e 	=> console.log(e, item)
														)
											}
						)
						//.then(() 		=> Promise.resolve({item:{id:id}}))
						// .then(result	=> result.item)
						// .then(item 		=> full_items.push(item) && item)
						// .then(item		=> console.log(item.title))
			})
		})
		return chain
	})



})

server.on('error', function(err) {
	console.error(err)
	process.nextTick(function() { 
		process.exit()
	})
})