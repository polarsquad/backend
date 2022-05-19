const icUtils	= require('../ic-utils.js')

function hasAutoTranslation(str){
	return 	str			
			&&	
			(
				str.match(/^\s*Google Translat/i) //legacy
				||
				str.match(/^\[[^\]]*:\]/i)
			)
}

function isValidFrom(str){
	return	str 
			&& 	 str.trim()
			&&	!hasAutoTranslation(str)
}

function isValidTo(str){
	return !isValidFrom(str)
}


function autoTranslate(dpd, from_language, to_language, execute, force_retranslate){

	console.log('\n')
	console.log(`## AT Auto translate, from ${from_language} to ${to_language}`)

	if(!from_language) 	return console.log("## AT AutoTranslate missing from_language: try paramter e.g.: from=de")
	if(!to_language) 	return console.log("## AT AutoTranslate missing to_language: try paramter e.g.: to=en")

	if(!icUtils.itemConfig || !icUtils.itemConfig.properties)
						return console.log('## AT AutoTranslate missing properties! [icUtils.config.properties]')

	const properties 				= 	icUtils.itemConfig.properties
	const auto_translate_properties	=	properties.filter( property => {
											if(!property.translatable)								return false
											if(!property.autoTranslate)								return false

											return true	
										})

	console.log('## AT Properties ready for autoTranslate: ', auto_translate_properties.map( property => property.name).join(', ') )								

	const stats						=	{ 
											total:					0,
											neededTranslation:		0,
											partiallySkipped: 		0,											
											fullySkipped:			0,
											translated:				0
										}

	dpd.items.get()
	.then( items => {


		stats.total = items.length

		// items that need translations:
		items =	items.filter( item => {

					const translation_possible	= 	auto_translate_properties.some( property => {
														if(!(property.name in item) )							return false			
														if(!isValidFrom(item[property.name][from_language]))	return false
														if(!isValidTo(item[property.name][to_language]))		return false

														return true	
													})

					return translation_possible

				})

		stats.neededTranslation	= items.length

		console.log('## AT Item with translatable content:', items.length)

		if(items.length == 0) console.log('## AT No items have translatable content, check icItemConfig for .translatable and .autoTranslate flags. [both required]')


		let p = Promise.resolve()		

		items.forEach( item => {			


			const applicable_properties = 	auto_translate_properties
											.filter( property => {
												if(!(property.name in item) )							return false			
												if(!isValidFrom(item[property.name][from_language]))	return false
												if(!isValidTo(item[property.name][to_language]))		return false

												return true	
											})

			const unskipable_properties	=	applicable_properties.filter( property => !hasAutoTranslation(item[property.name][to_language]) )								
			

			const use_properties		=	force_retranslate
											?	applicable_properties
											:	unskipable_properties

			const skipped_properties	=	applicable_properties.filter( property =>  !use_properties.includes(property) )								

	
			if(use_properties.length == 0) {
				stats.fullySkipped++
				return null
			}

			if(skipped_properties.length > 0) stats.partiallySkipped++

			console.log(`## AT Translating: (${item.id}) ${item.title && item.title.slice(0,12)}: ${use_properties.map( property => property.name).join(', ')}`)								
			
			p= p.then( async () => {

				let update = {id: item.id}

				await 	Promise.all(
							use_properties
							.map( async property => {						

								const from_content 	= (item[property.name][from_language] 	|| '').trim()
								const to_content	= (item[property.name][to_language] 	|| '').trim() 

								if(!execute){									



////
									console.log(`
## AT dry run: ${item.title && item.title.slice(0,12)} (${item.id}) ${from_language} -> ${to_language} [${property.name}]
   from: ${from_content.slice(0, 20)+'...'.padEnd(23,' ')} to: ${to_content.slice(0, 20)}...
									`)
////



									return null
								}

								let translation = 	await 	icUtils.getTranslation(from_language, to_language, from_content, config)
															.catch( reason =>{
////

																console.log(`								
## AT Translation failed:
	${item.title && item.title.slice(0,12)} (${item.id}) ${from_language} -> ${to_language} [${property.name}]
	from: 	${from_content.slice(0, 20)}...
	to: 	${to_content.slice(0, 20)}...
	
	reason:	${reason}
																`)
////
																throw reason

															}
								update[property.name] = item[property.name]

								update[property.name].en = `[${translation.translator}:] ${translation.text}`
								
							})
						).catch(console.log)


				return 	execute
						?	dpd.items.put(update)
							.then( ()=> {
								stats.translated++
							})
						:	null

			}).catch(console.log)

		})

		return p

	})
	.then(() => console.log('## AT AutoTranslation end.\n', stats))
}


exports.isValidFrom 	= isValidFrom
exports.isValidTo		= isValidTo
exports.autoTranslate 	= autoTranslate

