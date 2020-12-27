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
		const brief 		= 	{de: cleanString(offer.subtitle) }	
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
		const tags			= 	["service"]
	
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

	const result_array 	= 	fetch( config.url )
							.then( result 	=> result.json() )
							.then( data		=> {

								const locations = 	data.locations.map( ({location_id, url}) => {

														const locationData = getLocationData(data, location_id)

														return	locationData
																?	{
																		...locationData,
																		id:	key+'location'+location_id, //preliminary	
																		remoteItem: {
																			type: 		'raumplaner',
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
									const locations		= 	getLocationData(data, location_ids)

									const hours			=	{ de : dates.map( date => getHoursFromDate(date) ).join('\n\n') }

									if(locations.length == 0) locations.push({})

									locations.forEach( (locationData, index) => {

										const item = 	{
															...locationData,
															...offerData,
															id:	'offer'+offer_id+'-'+index,		//preliminary	
															hours,
															remoteItem: {
																original:	url,
																type:		'raumplaner'
															}
														}

										item.tags = item.tags ||[]				

										services.push(item)
									})

								})


								return [...locations, ...services]
							})
							.flat()
							.filter( item => !!item)

	return items
}