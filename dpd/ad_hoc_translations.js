server.on('listening', function() {
	console.log("Server is listening on "+ config.port)

	var dpd = internalClient.build(server)

	
	dpd.items.get()
	.then( items => {

		console.log(items[0].description.de)

		items = items.filter( item => !item.description || !item.description.en || !item.description.en.trim())

		console.log(items.length)

		let p = Promise.resolve()

		

		items.map( item => {

			console.log('Translating: '+item.id)
			
			p= p.then( async () => {

				let update = {id: item.id}

				await 	Promise.all(
							icUtils.itemConfig.properties
							.filter( property_obj => property_obj.translatable)
							.map( async property => {						

								if(!item[property.name].de || !item[property.name].de.trim()) return null
								if(item[property.name].en && item[property.name].en.trim()) return null

								let translation = await icUtils.getTranslation('de', 'en', item[property.name].de.trim(), config) 

								update[property.name] = item[property.name]

								update[property.name].en = `[${translation.translator}:] ${translation.text}`
								
							})
						).catch(console.log)

				return dpd.items.put(update)

			}).catch(console.log)

		})
		

	})


})