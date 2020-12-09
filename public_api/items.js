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

export async function invokeImportScript(key, path){

	const importModule 	= await import(`./import/${path}`)
	const items			= await importModule.getRemoteItems()

	return 	items.map( item => {
				itemConfig.properties.forEach( property => {
					item[property.name] = item[property.name] || property.defaultValue
				})	

				item.id = '--remote-'+key+'-'+Date.now()+Math.random()

				return item
			})
	
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

export async function getRemoteItems(remoteItemImports){
	
	if(!remoteItemImports) return wrapResult('unknown', 'failed', 'missing config', [])

	return 	await	Promise.all(
						Object.entries(remoteItemImports)
						.map( 
							([key, path]) =>	invokeImportScript(key, path) 
												.then(
													wrapSuccess(key),
													wrapFailure(key)
												)
						)				
					)				
					.then( mergeResults )
}

export async function getItems(db, remoteItemImports){

	return 	await	Promise.all([
						getLocalItems(db)
						.then(
							wrapSuccess('local'),
							wrapFailure('local')
						),
						getRemoteItems(remoteItemImports)
						.then( x => { console.log(x); return x })
					])
					.then(mergeResults)
}