import fetch 				from 'node-fetch'

import {	Translator	}	from '../translations.js'



export async function getRemoteVersion(config){

	//return some value to identify the version of the remote content

	const response 	= await fetch( config.url, { method:'HEAD' } )	
	const headers	= response.headers

	return headers.get('Last-Modified')
}


export async function getRemoteItems(config){	

	function cleanString(x){
		return String(x||'').trim() || undefined
	}


	function cleanNumber(x){

		if(typeof x == 'string') x = parseFloat(x)
		if(isNaN(x)) return undefined
		if(typeof x != 'number') return undefined

		return x	
	}

	function translationFill(x){
		return [config.baseLanguage, ...config.targetLanguages]. reduce( (acc,lang) => { acc[lang] = cleanString(x); return acc }, {})
	}


	function getOfferDates(data, id){
		if(!data) return null
		if(!data.dates) return null
		if(!data.events) return null

		const offerEventsIds = 	data.events
								.filter( 	({offer_id}) => offer_id == id)	
								.map( 		({event_id}) => event_id )

		return data.dates.filter( ({event_id}) => offerEventsIds.includes(event_id) )	
	}

	function getLocationData(data, id_or_array_of_ids){

		if(Array.isArray(id_or_array_of_ids)) return id_or_array_of_ids.map( id => getLocationData(data, id) ).filter( x => !!x)


		const id = id_or_array_of_ids

		if(!data.locations) return null

		const location = data.locations.find( ({location_id}) => location_id == id)

		if(!location) return null

		const title 		=	cleanString(location.name)
		const brief			=	translationFill(location.subtitle)
		const description	=	{de: cleanString(location.description)}
		const address		=	cleanString(location.street)
		const zip			=	cleanString(location.zipcode)
		const city			=	cleanString(location.town)
		const latitude		=	cleanNumber(location.latitude)
		const longitude		=	cleanNumber(location.longitude)
		const website		=	cleanString(location.url)		
		const tags			=	['location']


		return 	{
					title,
					brief,
					description,
					website,
					address,
					zip,
					city,
					latitude,
					longitude,
					tags
				}

	}

	function getOfferData(data, id_or_array_of_ids){

		if(Array.isArray(id_or_array_of_ids)) return id_or_array_of_ids.map( id => getOfferData(data, id) ).filter( x => !!x)

		const id = id_or_array_of_ids
			

		if(!data.dates) return null


		const offer = data.offers.find( ({offer_id}) => offer_id == id) 


		if(!offer) return null


		const title 		= 	cleanString(offer.title)
		const brief			=	translationFill(offer.subtitle || config.sourceName)
		const description	= 	{de: cleanString(offer.description) }

		const manager		= 		offer.manager_id 
								&& 	offer.manager_id[0]
								&& 	data.managers
									.find( m => m.manager_id == offer.manager_id) 
								||	{}

		const firstname		= 	cleanString(manager.firstname) 	|| ''
		const lastname		= 	cleanString(manager.lastname)	|| ''
		const contact		= 	cleanString(`${firstname} ${lastname}`)
		const email			= 	cleanString(manager.email)
		const phone			= 	cleanString(manager.phone)
		const website		= 	cleanString(offer.url)
		const categories	=	offer.info_category || []
		const target_groups	=	offer.info_target_group_id || []
		const tags			= 	["service", ...categories, ...target_groups]
	

		return {
			title,
			brief,
			description,
			contact,
			email,
			phone,
			website,
			tags
		}

	}

	function getHoursFromDate(date){

		if(!date) return null



		const days			= 	["Sonntag", "Montag", "Dienstag", "Mittwoch", "Donnerstag", "Freitag", "Samstag", "Sonntag"]
		const day			=	days[date.weekday] || "Tag"
		const frequencies 	=	{
									"each": 	"Jeden",
									"each_2":	"Jeden zweiten"
								}
		const frequency		=	frequencies[date.frequency]

		const startDate		=	new Date(date.start_day).toLocaleDateString('de')
		const endDate		=	new Date(date.end_day).toLocaleDateString('de')

		const startTime		=	date.start_time.match(/\d\d:\d\d/)[0]	|| ''
		const endTime		=	date.end_time.match(/\d\d:\d\d/)[0]		|| ''

		const date_ln		=	startDate + (startDate && endDate && ' – ') + endDate
		const frequency_ln	=	frequency && (frequency + " " + day+ ": ")
		const time_ln		=	startTime + (startTime && endTime && ' – ') + endTime

		const hours 		=	(date_ln + '\n' + frequency_ln + time_ln).trim()
						

		return hours 
	}


	function getLocationId(raumplaner_location_id){
		return 'location_'+raumplaner_location_id
	}

	function getServiceId(raumplaner_offer_id, index){
		return 'offer_'+raumplaner_offer_id+'-'+index
	}





	const data 		= 	await fetch( config.url )
						//.then( response => { console.log(response.headers); return response })
						.then( response => response.json() )
	

	const locations = 	data.locations.map( ({location_id, url}) => {

							const locationData = getLocationData(data, location_id)

							return	locationData
									?	{
											...locationData,
											id:	getLocationId(location_id),
											remoteItem: {
												original:	url
											}
										}
									: null
							

						})					

	const services = []

	data.offers.forEach( ({offer_id, url}) => {
	
		const offerData		=	getOfferData(data, offer_id)		

		if(!offerData) return null
	
		const dates			= 	getOfferDates(data, offer_id) || []
		const location_ids	=	Array.from( new Set(dates.map( ({location_id}) => location_id )) )

		const hours			=	{ de : dates.map( date => getHoursFromDate(date) ).join('\n\n') }

		if(locations.length == 0) locations.push({})

		location_ids.forEach( (location_id, index) => {

			const item = 	{
								...offerData,
								id:	getServiceId(offer_id, index),	
								location_ref: location_id,
								hours,
								remoteItem: {
									original:	url
								}
							}

							console.log(item.location_ref, locationData)

			item.tags = item.tags ||[]				

			services.push(item)
		})

	})



	const items				=	[...locations, ...services]
								.filter( item => !!item)
								
								.map( item =>	({
													...item, 
													remoteItem:{
														...item.remoteItem, 
														type: 'raumplaner'
													}
												})
								)

	
	
	return items
}