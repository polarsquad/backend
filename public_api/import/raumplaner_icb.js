import fetch from 'node-fetch'

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
		const brief			=	{de: cleanString(location.subtitle)}
		const description	=	cleanString(location.description)
		const address		=	cleanString(location.street)
		const zip			=	cleanString(location.zipcode)
		const city			=	cleanString(location.town)
		const latitude		=	cleanNumber(location.latitude)
		const longitude		=	cleanNumber(location.longitude)
		const tags			=	['location']

		return 	{
					title,
					brief,
					description,
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
		const brief 		= 	{de: cleanString(offer.subtitle) }	
		const description	= 	cleanString(offer.description)

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
		const url			= 	cleanString(offer.url)
		const tags			= 	["service"]
	
		return {
			title,
			brief,
			description,
			contact,
			email,
			phone,
			url,
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
		const frequency_ln	=	frequency && (frequency + " " + day)
		const time_ln		=	startTime + (startTime && endTime && ' – ') + endTime

		const hours 		=	[date_ln, frequency_ln, time_ln]
								.filter( x => !!x.trim())	 	
								.join('\n')
						

		return hours 
	}

	const result_array 	= 	await	Promise.all(
										Object.entries(config.urls)
										.map( ([key, source])	=> 	fetch(source)
																	.then( result 	=> result.json() )
																	.then( data		=> [key, source, data])
										)
									)

	const items			=	result_array.map( ([key, source, data]) => {

								const locations = 	data.locations.map( ({location_id, url}) => {

														const locationData = getLocationData(data, location_id)

														return	locationData
																?	{
																		...locationData,
																		remoteItem: {
																			type: 		'raumplaner',
																			instance:	key,
																			source,
																			url
																		}
																	}
																: null
														

													})					

								const services = []

								data.offers.forEach( ({offer_id, url}) => {
								
									const offerData		=	getOfferData(data, offer_id)		

									if(!offerData) return null
								
									const dates			= 	getOfferDates(data, offer_id) || []
									const locations		= 	getLocationData(data, dates.map( ({location_id}) => location_id ))

									const hours			=	dates.map( date => getHoursFromDate(date) ).join('\n\n')

									if(locations.length == 0) locations.push({})

									locations.forEach( locationData => {
										services.push({
											...locationData,
											...offerData,
											hours,
											remoteItem: {
													type: 		'raumplaner',
													instance:	key,
													source,
													url:		url
												}
										})
									})

								})


								return [...locations, ...services]
							})
							.flat()
							.filter( item => !!item)

	return items
}