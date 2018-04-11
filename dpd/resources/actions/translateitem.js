
cancelUnless( 
        internal
    ||  (me && me.privileges.indexOf('edit_items') != -1),
    "unauthorized", 401
)


var req 			= ctx.body,
	icItemConfig    = require(process.cwd()+'/public/ic-item-config.js')



if(!req.item) 		ctx.done('missing item.')
if(!req.from) 		ctx.done('missing from language(s).')
if(!req.to) 		ctx.done('missing target language(s).')

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
					var from_language = req.from.filter( lang => item[property][lang] && !item[property][lang].match(/^\s*Google Translate/))[0]

					if(!from_language) return false

					return 	Promise.all(
								req.to
								.filter(	to_lang	=> 	!item[property][to_lang] || item[property][to_lang].match(/^\s*Google Translate/) )
								.map( 		to_lang	=> 	icUtils.getGoogleTranslation(from_language, to_lang, item[property][from_language]) 
														.catch( ()			=> 'not available.')														
														.then( translation 	=> item[property][to_lang] = "Google Translate: "+translation)
								)
							)

				})
			)
			.then( () => ctx.dpd.items.put(item))
			.then( () => setResult(item) )
			.catch( reason => ctx.done(reason))
})
.finally($finishCallback)