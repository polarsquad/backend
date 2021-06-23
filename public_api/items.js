import	sanitizeHtml 				from 'sanitize-html'


export class ItemImporter {

	constructor({db, publicApiConfig, translator, itemConfig}){
		this.db 				= db
		this.publicApiConfig 	= publicApiConfig
		this.translator			= translator
		this.itemConfig			= itemConfig
	}


	get localItems(){
		return this.db.collection('items')
	}

	get remoteMeta(){
		return this.db.collection('remote-meta')
	}


	wrapResult(key, status, message, items = []){
		return {key, status, message, items}
	}


	wrapSuccess(key){
		return	items	=> this.wrapResult(key, 'ok', null, items)
	}


	wrapFailure(key){
		return	reason	=> {
					console.log(reason)
					this.wrapResult(key, 'failed', String(reason), [])
				}
	}


	async getLocalItems(){

		const items = 	await 	this.localItems
								.find({
									state:'public',
									proposalFor:null,
								})
								.toArray()
		
		// START: this is just to get an overview of how many tags are used:

		var tags 	= new Set()
		var re		= /<([a-zA-Z\-]+)/gi

		items.forEach( item => {
			
			var m;

			for(var key in item.description){
				do {
					m = re.exec(item.description[key]);
					if (m) {
						tags.add(m[1].toUpperCase())
					}
				} while (m)
			}
				
		})

		console.log('HTML tags in item properties: ')
		console.log(Array.from(tags).join(', '))

		//END




		return 	items.map( ({_id, ...item}) => ({
					...item,
					id: _id						
				}))			
	}

	sanatizeProperty(property){

		if(typeof property == 'object' && !Array.isArray(property)){

			const result = {}

			Object.entries(property).forEach( ([key, value]) => { result[key] =  this.sanatizeProperty(value) })

			return result
		}

		if(typeof property != 'string') return property

		return	sanitizeHtml(property, {
					allowedTags: ['p', 'em', 'strong', 'br', 'ul', 'li', 'b', 'i'],
					allowedAttributes: {}
				}).replace('&amp;', '&') 

		 
	}

	async invokeImportScript(key){

		console.log(key, this.publicApiConfig)

		const config			=	this.publicApiConfig.remoteItems[key]
		const importModule 		= 	await import(`./import/${config.script}`)
		const remoteVersion		= 	await importModule.getRemoteVersion(config)
		const localVersion		= 	await this.remoteMeta.findOne({ key }).then( doc => doc && doc.version )
		const noUpdateNeeded	=	localVersion === remoteVersion


		console.log(remoteVersion, localVersion, noUpdateNeeded)

		if(noUpdateNeeded) return await this.db.collection(`remote-items-${key}`).find().toArray()

		console.log('update needed ', key)	

		const items				= 	await importModule.getRemoteItems(config, this.translator)

		const extendedItems		=	items.map( (item, index) => {

										this.itemConfig.properties.forEach( property => {
											let buf = this.sanatizeProperty(item[property.name]) || null
											if( buf !== null || item[property.name] !== undefined ) item[property.name] = buf
										})	

										const preliminary_id = item.id 

										item.id = 	preliminary_id
													?	'r-'+key+preliminary_id
													:	'r-'+key+Date.now()+index+Math.random()

										item.state = 'public'

										item.remoteItem = 	{
																...item.remoteItem,
																key,
																...config
															}

										return item

									})
									.filter( item => !!item)
		
		await this.db.collection(`remote-items-${key}`).drop().catch( error => error.code == 26 ? Promise.resolve : Promise.reject(error)) //ignore error if colelction does not yet exists
		await this.db.collection(`remote-items-${key}`).insertMany(extendedItems)

		this.remoteMeta.updateOne({ key }, {$set: { version: remoteVersion } }, { upsert: true })									

		return extendedItems
	}


	mergeResults(results){

		console.log('Merging results:')
		results.forEach( ({key, status, message, items}) => console.log({key, status, message, size: items.length}))

		return 	{
					results: 	results
								.map( ({items, ...meta }) => meta.results || [ meta ] )
								.flat(),

					items:		results.map( ({items}) => items || [])
								.flat()
				}
	}

	async translateItem(item, key){

		const { baseLanguage, targetLanguages } = this.publicApiConfig.remoteItems[key]

		if(!baseLanguage) 		return item
		if(!targetLanguages)	return item

		return await this.translator.translateItem(item, baseLanguage, targetLanguages, key)
	}

	async translateItems(items, key){
		return await Promise.all(  items.map( item => this.translateItem(item, key) ) ) 
	}

	async getRemoteItems(){
	
		const remoteItemsConfig = this.publicApiConfig.remoteItems

		if(!remoteItemsConfig) return this.wrapResult('unknown', 'failed', 'missing remote item config', [])

		return 	await	Promise.all(
							Object.entries(remoteItemsConfig)
							.map( 
								([key, config]) =>	this.invokeImportScript(key) 
													.then( items => this.translateItems(items, key) )
													.then(
														this.wrapSuccess(key),
														this.wrapFailure(key)
													)
							)				
						)				
						.then( results => this.mergeResults(results) )
	}

	async getItems(){

		const results	=  	await	Promise.all([
										this.getLocalItems()
										.then(
											this.wrapSuccess('local'),
											this.wrapFailure('local')
										),
										this.getRemoteItems()
									])
				
		return this.mergeResults(results)

	}

}