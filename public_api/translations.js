import	{	getTranslation			}	from '../ic-utils.js'

import	{	properties as icProperties	}	from './ic-item-config.cjs'
import	crypto								from 'crypto'	


export class Translator{

	constructor(
		db,
		keys,		
	){

		const { googleTranslateApiKey, deepLApiKey} = keys

		this.db 			= db
		this.keys			= { googleTranslateApiKey, deepLApiKey}

	}

	get collection(){
		return this.db.collection('translations')
	}




	hash(value){
		const hash 	=  	crypto
						.createHash('md5')
						.update(value)
						.digest('base64')

		return 	hash.length < value.length
				? hash
				: value
	}



	async getStoredTranslations(hash){

		const result = 	await 	this.collection
								.findOneAndUpdate(
									{ hash },
									{ $set:		{lastRequest: Date.now() } },
									{ upsert:	false }
								)

		return result.value || {}
	}




	async getNewTranslation(from, to, text, hash){

		console.log('Getting new translation for ', hash)

		hash = hash || this.hash(text)

		const translation 	= await getTranslation(from, to, text, this.keys)
		const lastRequest	= Date.now()

		this.collection.updateOne(
			{ hash }, 
			{ $set:{ hash, [to]: translation, lastRequest } }, 
			{ upsert:true }
		)

		return translation
	}

	async translate(from_language, to_languages, text){

		to_languages = 	Array.isArray(to_languages)
						?	to_languages
						:	[to_languages]

		const hash					= await this.hash(text)
		const stored_translations	= await this.getStoredTranslations(hash)
		const result				= {}


		return await	Promise.all(to_languages.map( to_language => {
							return 	Promise.resolve(
											stored_translations[to_language] 
										|| 	this.getNewTranslation(from_language, to_language, text, hash)
									)
									.then( translation => result[to_language] = translation)
						}))
						.then( () => result )


	}

	async translateItem(item, from_language, to_languages){

		to_languages = 	Array.isArray(to_languages)
						?	to_languages
						:	[to_languages]


		const translatables = 	icProperties
								.filter( 	property => property.translatable)
								.map( 		property => property.name)

				


		await Promise.all(translatables.map( async (translatable) => {

			const map 			= 	item	&& item[translatable]
			const value 		= 	map		&& map[from_language]
			const trimmed_value	=	value	&& value.trim()


			if(!trimmed_value) return null

			const translations	= 	await 	this.translate(
												from_language, 
												to_languages.filter( lang => !item[translatable][lang] ), 
												trimmed_value
											)
											.catch( reason => ({'translator': 'translation failed'}))

			Object.keys(translations).forEach( lang => {

				const t = translations[lang]

				if(!t) return null

				item[translatable][lang] = `[${t.translator}:] ${t.text}`

			})

		}))

		return item

	}

}
