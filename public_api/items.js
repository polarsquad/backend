import	sanitizeHtml 				from 'sanitize-html'


export class ItemImporter {

	constructor({db, publicApiConfig, translator, itemConfig}){
		this.db 				= db
		this.publicApiConfig 	= publicApiConfig
		this.translator			= translator
		this.itemConfig			= itemConfig
	}


	get collection(){
		return this.db.collection('items')
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

		const items = 	await 	this.collection
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
					allowedTags: [],
					allowedAttributes: {}
				}).replace('&amp;', '&') 

		 
	}

	async invokeImportScript(key, config){

		const importModule 	= await import(`./import/${config.script}`)
		const items			= await importModule.getRemoteItems(config, this.translator)

		return 	items.map( (item, index) => {

					this.itemConfig.properties.forEach( property => {
						let buf = this.sanatizeProperty(item[property.name]) || null
						if( buf !== null || item[property.name] !== undefined ) item[property.name] = buf
					})	

					const preliminary_id = item.id 

					item.id = 	preliminary_id
								?	'--r-'+key+preliminary_id
								:	'--r-'+key+Date.now()+index+Math.random()

					item.state = 'public'

					item.remoteItem = 	{
											...item.remoteItem,
											key,
											...config
										}

					return item
				})
				.filter( item => !!item)
		
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


	async getRemoteItems(){
	
		const remoteItemsConfig = this.publicApiConfig.remoteItems

		if(!remoteItemsConfig) return wrapResult('unknown', 'failed', 'missing config', [])

		return 	await	Promise.all(
							Object.entries(remoteItemsConfig)
							.map( 
								([key, config]) =>	this.invokeImportScript(key, config) 
													.then(
														this.wrapSuccess(key),
														this.wrapFailure(key)
													)
							)				
						)				
						.then( results => this.mergeResults(results) )
						//.then( result => {console.log(JSON.stringify(result.items, null, 4)); return result} )
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