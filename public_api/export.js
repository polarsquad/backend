import 	{	OptionLabels	}	from './option-labels.js'
import	{	
			writeFileSync,
			readFileSync	
		}						from 'fs'

import icUtils 			from '../ic-utils.js'
import icItemConfig		from './ic-item-config.cjs'


function prep(str){
	if(typeof str != 'string') return ''
	return 	str
			.replace(/\s/g, '_')
			.replace(/([a-z])([A-Z])/g, '$1_$2')
			.toUpperCase()
}

export class ItemExporter {


	constructor({db, config}){

		this.db 			= db
		this.icConfig		= config

		this.optionLabels	= new OptionLabels(db)		

	}



	translate(key, lang, returnKey = true){
		key = 	key || ''

		key = 	key
				.replace(/\s/g, '_')
				.replace(/([a-z])([A-Z])/g, '$1_$2')
				.toUpperCase()

		return icUtils.getInterfaceTranslation(key, lang, returnKey)
	}


	getCsvColumns(lang, av_langs, {properties, tagGroups, taxonomy}){
		const columns = []

		columns.push({
			label:		'ID',
			content: 	(item) => item._id
		})

		properties 	= Array.isArray(properties)	? properties 	: []
		tagGroups	= Array.isArray(tagGroups)	? tagGroups		: []

		icItemConfig.properties
		.filter( 	property 	=> 	!property.internal)
		.filter( 	property 	=> 	properties.includes(property.name) )
		.forEach( 	property 	=> {

			//ignore image
			if(property.name 	== 'image') 			return null
			
			//ignore state (will use public items only anyways)
			if(property.name 	== 'state') 			return null

			//ignore editingNote
			if(property.name 	== 'editingNote') 		return null	

			//ignore resubmissionDate
			if(property.name 	== 'resubmissionDate') 	return null	

			if(property.name	== 'primaryTopic'){
				columns.push({
					label:		this.translate(`ITEMS.${property.name}`, lang),								
					content:	(item)  => this.translate(`CATEGORIES.${item[property.name]}`, lang)
				})

				return null
			}
		

			// special: .tags
			if(property.name == 'tags'){


				// //type:
				// if(icTaxonomy.types && icTaxonomy.types.length > 0){
				// 	columns.push({
				// 		label: 		this.translate(`ITEMS.TYPE`, lang),
				// 		content: 	(item) => 	this.translate(`TYPES.${icTaxonomy.getType(item.tags)}`, lang) 
				// 	})
				// }

				// if(icTaxonomy.categories && icTaxonomy.categories.length > 0){

				// 	columns.push({
				// 		label: 		$translate(`ITEMS.CATEGORY`, lang),
				// 		content: 	(item) => 	icTaxonomy.categories
				// 								.filter(	category => item.tags.includes(category.name) )
				// 								.map( 		category => this.translate(`CATEGORIES.${category.name}`, lang) )
				// 								.join(', ')
				// 	})
				// }


				// if(icTaxonomy.tags) {
				// 	Object.entries(icTaxonomy.tags).map( ([key, tag_group]) => {

				// 		if(['lists'].includes(key)) return null

				// 		columns.push({
				// 			label: 		this.translate(`ITEMS.${key}`, lang),
				// 			content: 	(item) => 	tag_group
				// 									.filter(	tag => item.tags.includes(tag) )
				// 									.map( 		tag => this.translate(`UNSORTED_TAGS.${tag}`, lang) )
				// 									.join(', ')
				// 		})								

				// 	})
				// }

				return null
			}

			if(property.translatable){
				av_langs.forEach( lang => {
					if(lang.toUpperCase() == 'NONE') return null


					columns.push({
						label:		[
										this.translate(`ITEMS.${property.name}`, lang),
										this.translate(`LANGUAGES.${lang}`, lang)
									].join(' - '),
						content:	(item)  => item[property.name] && item[property.name][lang]
					})
				})
				return null
			}


			if(property.type == 'string'){
				columns.push({
					label:		this.translate(`ITEMS.${property.name}`, lang),
					content: 	(item) => item[property.name]
				})
			}


		})

		if(taxonomy){
			tagGroups.forEach( tagGroup => {

				const tags = taxonomy.tags && taxonomy.tags[tagGroup]

				if(!Array.isArray(tags)) return;

				columns.push({
					label:		this.translate(`INTERFACE.TAGS_${tagGroup}`, lang),
					content: 	(item) => 	item.tags
											.filter( 	tag => 	tags.includes(tag))
											.map(		tag => 	this.translate(`UNSORTED_TAGS.${tag}`, lang, false) || this.optionLabels.getLabel(tag) || tag )
											.join(', ')
				})			
			})
		}

		// tags.forEach( tag => {

		// 	columns.push({
		// 		label: 		this.translate('UNSORTED_TAGS.${tag}', 	lang, false)
		// 				||	this.translate('CATEGORY.${tag}', 		lang, false)
		// 				||	this.translate('TYPE_TAGS.${tag}', 		lang, false)
		// 				||	tag,
		// 		content: (item) => ''+item.tags.includes(tag)
		// 	})
		// })


		console.log(columns)

		return columns

	}


	async getCsvData(lang, config){
		const items 		= 	await 	this.db.collection('items')
										.find({
											state:'public',
											proposalFor:null,
										})
										.toArray()		

		console.log('NUMBER OF ITEMS', items.length)

		const tr_props		= 	icItemConfig.properties.filter( prop => prop.translatable)

		const av_langs		= 	Array.from( new Set( 
									items.reduce( 
										(sum, item) => sum.concat( tr_props.map( prop => Object.keys(item[prop.name] || {}) ).flat() ),
										[]
									)
									.filter( lang => isNaN(parseInt(lang) )) // sometimes strings are stored in translatable properties, so indices get counted as langs =/
									.filter( lang => lang.toUpperCase() != 'NONE') 
								))		




		const columns 		= this.getCsvColumns(lang, av_langs, config)
		const rows			= []

		const header_row 	= columns.map( col => col.label )

		rows.push(header_row)


		items.forEach( (item) => {
			rows.push( columns.map( col => col.content(item) ) )
		})
	
		return rows
	}

	async getCSV(lang, config) {

		await this.optionLabels.update()

		const csv_data 	= 	await this.getCsvData(lang, config )

		const csv_str	= 	csv_data.map( row => 
								row.map( entry => {
									entry = entry || ""
									entry = entry.replace(/"/g, "'")	 
									entry = entry.trim()
									entry = `"${entry}"`

									return entry
								})
								.join(',')
							)
							.join('\r\n')

		return csv_str
	}

	getTodayStr(){

		const today = new Date()
		const year	= (today.getFullYear()).toString()
		let   month = (today.getMonth()+1).toString()
		let   day	= (today.getDate()).toString()

		if(month.length < 2) month 	= '0'+month
		if(day.length	< 2) day	= '0'+day

		return [year, month, day].join('-')
	}

	getCsvFilename(lang) {
		return 	(this.translate('INTERFACE.TITLE', lang) ||'infocompass').replace(/[^a-zA-Z0-9äüöß], '_'/gi,).toLowerCase()
				+ '_'
				+ this.getTodayStr()
				+ '.csv'
	}

	async storeCsvFile(dir, lang, config){

		const csv 	= await this.getCSV(lang, config)

		await writeFileSync(dir+`/last_export_${lang}.csv`, csv, 'utf8')
		return this.getCsvFilename(lang)
	}

	async getCsvFile(dir, lang){
		const csv	=	readFileSync(dir+`/last_export_${lang}.csv`, 'utf8')
		return csv
	}

	
}

