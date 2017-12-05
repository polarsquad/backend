var query   	= ctx.query,
    format  	= query.format.toUpperCase()    || 'JSON',
    keys    	= query.keys.split(',')         || [],
    response	= this

function sanetizePropertiy(prop){
    if(typeof prop != 'string') prop = JSON.stringify(prop)
    return prop.replace(",", "\\COMMA")
}

$addCallback()

dpd.items.get({})
.then( items => {
    if(format =='CSV'){
        ctx.res.setHeader('Content-Type', 'text/csv')
        ctx.res.setHeader('content-disposition', "attachment; filename=\"" + icUtils.config.title.toLowerCase()+"_items.csv\"")
        return      keys.join(',')+'\n'
                   +items.map( item => keys.map( key => sanetizePropertiy(item[key])).join(',')).join('\n')
    }
    ctx.res.setHeader('Content-Type', 'application/json')   
    return  JSON.stringify(items.map( item => keys.reduce( (result, key) => {result[key] = item[key]; return result}, {})))
})
.then( result =>  ctx.res.end(result))

