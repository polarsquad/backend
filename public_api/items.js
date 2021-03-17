import	sanitizeHtml 				from 'sanitize-html'
import	{ writeFileSync 		}	from 'fs'

let itemConfig


try{
	itemConfig	= await import('./ic-item-config.cjs')
}catch(e){
	console.log(e)
	console.log('\nMissing public_api/ic-item-config.cjs. Please run "npm run setup" in parent folder first. \n\n')
	process.exit(1)
}





export function wrapResult(key, status, message, items = []){
	return {key, status, message, items}
}


export function wrapSuccess(key){
	return	items	=> wrapResult(key, 'ok', null, items)
}


export function wrapFailure(key){
	return	reason	=> {
				console.log(reason)
				wrapResult(key, 'failed', String(reason), [])
			}
}


export async function getLocalItems(db){
	const items = 	await 	db.collection("items")
							.find({
								state:'public',
								proposalFor:null,
							})
							.toArray()
		
	var tags = new Set()
	var re = /<([a-zA-Z\-]+)/gi;

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

	return 	items.map( ({_id, ...item}) => ({
				...item,
				id: _id						
			}))			
}

export function sanatizeProperty(property){

	if(typeof property == 'object' && !Array.isArray(property)){

		const result = {}

		Object.entries(property).forEach( ([key, value]) => { result[key] =  sanatizeProperty(value) })

		return result
	}

	if(typeof property != 'string') return property

	return	sanitizeHtml(property, {
				allowedTags: [],
				allowedAttributes: {}
			}).replace('&amp;', '&') 

	 
}

export async function invokeImportScript(key, config){

	const importModule 	= await import(`./import/${config.script}`)
	const items			= await importModule.getRemoteItems(config)

	return 	items.map( (item, index) => {


				itemConfig.properties.forEach( property => {
					let buf = sanatizeProperty(item[property.name]) || null
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


export function mergeResults(results){

	console.log('Results:', results.key, results.status, results.message, results.items.legth)

	return 	{
				results: 	results
							.map( ({items, ...meta }) => meta.results || [ meta ] )
							.flat(),

				items:		results.map( ({items}) => items || [])
							.flat()
			}
}


export async function getRemoteItems(remoteItemsConfig){
	
	if(!remoteItemsConfig) return wrapResult('unknown', 'failed', 'missing config', [])

	return 	await	Promise.all(
						Object.entries(remoteItemsConfig)
						.map( 
							([key, config]) =>	invokeImportScript(key, config) 
												.then(
													wrapSuccess(key),
													wrapFailure(key)
												)
						)				
					)				
					.then( mergeResults )
}

export async function getItems(db, publicApiConfig){

	const results	=  	await	Promise.all([
									getLocalItems(db)
									.then(
										wrapSuccess('local'),
										wrapFailure('local')
									),
									getRemoteItems(publicApiConfig.remoteItems)
									//.then( x => { console.log(x); return x })
								])
						
	return meregeResults(results)

}