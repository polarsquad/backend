
cancelUnless( 
        internal
    ||  (me && me.privileges.indexOf('edit_items') != -1),
    "unauthorized", 401
)


var req 			= ctx.body,
	icItemConfig    = require(process.cwd()+'/public/ic-item-config.js')



cancelUnless(req.item, 	'missing item.', 400)
cancelUnless(req.from, 	'missing from language(s).', 400)
cancelUnless(req.to, 	'missing target language(s).', 400)

if(typeof req.from 			== 'string') req.from 		= [req.from]
if(typeof req.to 			== 'string') req.to 		= [req.to]
if(typeof req.properties 	== 'string') req.properties = [req.properties]



$addCallback()


var properties_to_translate = 	req.properties && req.properties.length
								?	req.properties
								:	icItemConfig.properties
									.filter( property_obj => property_obj.translatable)
									.map( property_obj => property_obj.name)

if(properties_to_translate.length == 0){
	$finishCallback()
	ctx.error('no translatable properties found')
}


function isValidFrom(str){
	return	str 
			&&	!str.match(/^\s*Google Translat/i) //legacy
			&&	!str.match(/^\[[^\]]*:\]/i)
}

function isValidTo(str){
	return !isValidFrom(str)
}


ctx.dpd.items.get({id:req.item})
.then( item => {

	return 	Promise.all(
				properties_to_translate
				.filter( 	property => !!item[property] )
				.map( 		property => {

					console.log(property.name)

					var from_language = req.from.filter( lang => isValidFrom(item[property][lang]))

					console.log('from_language: ', from_language)

					if(!from_language) return false

					return 	Promise.all(
								req.to
								.filter(lang => isValidTo(item[property][lang]))
								.map( 		to_lang	=> 	icUtils.getTranslation(from_language, to_lang, item[property][from_language]) 
														.then( 
															translation 	=> {
																console.log(translation)
																if(translation.translator && translation.text ){
																	item[property][to_lang] = "["+translation.translator+":] "+translation.text
																}
															},
															reason			=> {
																console.log(reason)
																item[property][to_lang] = "[translation failed:]"
															}
														)
								)
							)

				})
			)
			.then( 	() => ctx.dpd.items.put(item))
			.then( 	updated_item => setResult(updated_item) )
			.catch( reason => ctx.done(reason))
})
.catch( e => { console.log(e); cancel('item not found', 404) })
.finally($finishCallback)