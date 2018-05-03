
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


ctx.dpd.items.get({id:req.item})
.then( item => {

	return 	Promise.all(
				properties_to_translate
				.filter( 	property => !!item[property] )
				.map( 		property => {
					var from_language = req.from.filter( lang => item[property][lang] && !item[property][lang].match(/^\s*Google Translat/i))[0]

					if(!from_language) return false

					return 	Promise.all(
								req.to
								.filter(	to_lang	=> 	!item[property][to_lang] || item[property][to_lang].match(/^\s*Google Translat/i) )
								.map( 		to_lang	=> 	icUtils.getGoogleTranslation(from_language, to_lang, item[property][from_language]) 
														.catch( ()			=> 'not available.')														
														.then( translation 	=> {
															item[property][to_lang]	= "Google Translate: "+translation
														})
								)
							)

				})
			)
			.then( 	() => ctx.dpd.items.put(item))
			.then( 	updated_item => setResult(updated_item) )
			.catch( reason => ctx.done(reason))
})
.catch( e => cancel('item not found', 404) )
.finally($finishCallback)