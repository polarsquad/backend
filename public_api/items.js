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
			})

	 
}

export async function invokeImportScript(key, config){

	const importModule 	= await import(`./import/${config.script||config}`)
	const items			= await importModule.getRemoteItems(config)

	return 	items.map( (item, index) => {
				itemConfig.properties.forEach( property => {
					item[property.name] = sanatizeProperty(item[property.name]) || null
				})	

				item.id = '--remote-'+key+'-'+Date.now()+index+Math.random()
				item.state = 'public'

				return item
			})
			.filter( item => !!item)
	
}


export function mergeResults(results){

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

export async function getItems(db, remoteItemsConfig){

	return 	await	Promise.all([
						getLocalItems(db)
						.then(
							wrapSuccess('local'),
							wrapFailure('local')
						),
						getRemoteItems(remoteItemsConfig)
						//.then( x => { console.log(x); return x })
					])
					.then(mergeResults)
}