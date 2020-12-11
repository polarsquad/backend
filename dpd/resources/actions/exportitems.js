var query   	= ctx.query,
	format  	= (query.format    || 'json').toUpperCase(),
	keys    	= (query.keys      || 'title').split(',')
	tags        = (query.tags      || 'title').split(',')
	response	= this

function sanetizePropertiy(prop){
	if(!prop) return ""
	if(typeof prop != 'string') prop = JSON.stringify(prop)
	return prop.replace(",", "\\COMMA")
}

$addCallback()


dpd.items.get({})
.then( items => {

	if(tags && tags.length > 0){
		items =	items.filter( function(item){
					return item.tags.some( function(tag){ return tags.includes(tag) } )
				})
	}

	items.forEach( item => {
		item.link = icConfig.frontendUrl+'/item/'+item.id
	})

	if(format =='CSV'){
		ctx.res.setHeader('Content-Type', 'text/csv; charset=utf-8')
		ctx.res.setHeader('content-disposition', "attachment; filename=\"" + (icUtils.config.title||'ic').toLowerCase()+"_items.csv\"")
		return      keys.join(',')+'\n'
				   +items.map( item => keys.map( key => sanetizePropertiy(item[key])).join(',')).join('\n')
	}
	ctx.res.setHeader('Content-Type', 'application/json')   
	return  JSON.stringify(items.map( item => keys.reduce( (result, key) => {result[key] = item[key]; return result}, {})))
})
.then( result =>  ctx.res.end(result))

