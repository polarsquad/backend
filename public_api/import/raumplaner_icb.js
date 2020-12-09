export async function getRemoteItems(){	

	let data 	=	await Promise.resolve({
						"locations": [
							{
								"location_id": "1",
								"name": "muster-stadtteilzentrum",
								"title": "Muster StadtTeilZentrum",
								"subtitle": "Ein Ort für viele.",
								"description": "Dieses ist die Beschreibung für ein Stadtteilzentrum.",
								"street": "Musterstraße 45",
								"zipcode": "12345",
								"town": "Musterstadt",
								"url": "http://home.tpl",
								"latitude": "52.531677",
								"longitude": "13.381777"
							},
							{
								"location_id": "2",
								"name": "muster-stadtteilzentrum-2",
								"title": "Muster StadtTeilZentrum 2",
								"subtitle": "Ein Ort für alle.",
								"description": "Dieses ist die Beschreibung für noch ein Stadtteilzentrum.",
								"street": "Musterstraße 43",
								"zipcode": "12346",
								"town": "Musterstadt2",
								"url": "http://home2.tpl",
								"latitude": "52.531671",
								"longitude": "13.381771"
							}
						],
						"managers": [
							{
								"manger_id": "1",
								"firstname": "Maria",
								"lastname": "Muster",
								"function": "Mitarbeiterin",
								"description": "Mitarbeiterin mit sehr viel Erfahrung.",
								"email": "maria@muster.tpl",
								"phone": "0123456789"
							},
							{
								"manger_id": "2",
								"firstname": "Paule",
								"lastname": "Tester",
								"function": "Mitarbeiter",
								"description": "Mitarbeiter mit sehr viel Erfahrung.",
								"email": "paule@tester.tpl",
								"phone": "0987654321"
							}
						],
						"offers": [
							{
								"offer_id": "1",
								"manger_id": [
									"1",
									"2"
								],
								"name": "muster-offer",
								"title": "Muster Angebot",
								"subtitle": "Ein schönes Angebot für Kinder.",
								"description": "Dieses ist die Beschreibung für ein Angebot.",
								"url": "http://home.tpl/muster-offer",
								"info_target_group_id": [
									"da brauchen wir die IDs für die Zielgruppen",
									"ID der zweiten Zielgruppe"
								],
								"info_category": [
									"da brauchen wir die IDs für die Themen",
									"ID des zweiten Themas"
								],
								"info_filter": [
									"IDs für Filter",
									"KOMMENTAR: existiert noch nicht, wie wird damit umgegangen, wenn es nicht übergeben wird?"
								]
							},
							{
								"offer_id": "2",
								"manger_id": [
									"2"
								],
								"name": "muster-offer-2",
								"title": "Muster Angebot zwei",
								"subtitle": "Ein schönes Angebot für Jugendliche.",
								"description": "Dieses ist die Beschreibung für dieses Angebot.",
								"url": "http://home.tpl/muster-offer-2",
								"info_target_group_id": [
									"da brauchen wir die IDs für die Zielgruppen",
									"ID der zweiten Zielgruppe"
								],
								"info_category": [
									"da brauchen wir die IDs für die Themen",
									"ID des zweiten Themas"
								],
								"info_filter": [
									"IDs für Filter",
									"KOMMENTAR: existiert noch nicht, wie wird damit umgegangen, wenn es nicht übergeben wird?"
								]
							}
						],
						"events": [
							{
								"event_id": "1",
								"offer_id": "1"
							},
							{
								"event_id": "2",
								"offer_id": "2"
							},
							{
								"event_id": "3",
								"offer_id": "2"
							}
						],
						"dates": [
							{
								"date_id": "1",
								"event_id": "1",
								"location_id": "2",
								"start_day": "2020-11-09",
								"end_day": "2020-12-11",
								"start_time": "09:00",
								"end_time": "12:00",
								"frequency": "each",
								"weekday": "5"
							},
							{
								"date_id": "2",
								"event_id": "2",
								"location_id": "2",
								"start_day": "2020-11-09",
								"end_day": "2020-11-11",
								"start_time": "09:00",
								"end_time": "12:00",
								"frequency": "none",
								"weekday": "0"
							},
							{
								"date_id": "3",
								"event_id": "2",
								"location_id": "1",
								"start_day": "2020-11-13",
								"end_day": "2020-11-16",
								"start_time": "09:00",
								"end_time": "12:00",
								"frequency": "none",
								"weekday": "0"
							},
							{
								"date_id": "4",
								"event_id": "3",
								"location_id": "1",
								"start_day": "2020-11-19",
								"end_day": "2020-11-19",
								"start_time": "09:00",
								"end_time": "18:00",
								"frequency": "none",
								"weekday": "0"
							}
						],
						"days": [
							{
								"day_id": "1",
								"date_id": "1",
								"location_id": "2",
								"day": "2020-11-13",
								"start_time": "09:00",
								"end_time": "12:00"
							},
							{
								"day_id": "2",
								"date_id": "1",
								"location_id": "1",
								"day": "2020-11-20",
								"start_time": "09:00",
								"end_time": "12:00"
							},
							{
								"day_id": "3",
								"date_id": "1",
								"location_id": "2",
								"day": "2020-11-27",
								"start_time": "09:00",
								"end_time": "13:00"
							},
							{
								"day_id": "4",
								"date_id": "1",
								"location_id": "2",
								"day": "2020-12-04",
								"start_time": "09:00",
								"end_time": "13:00"
							},
							{
								"day_id": "5",
								"date_id": "1",
								"location_id": "2",
								"day": "2020-12-11",
								"start_time": "09:00",
								"end_time": "13:00"
							},
							{
								"day_id": "6",
								"date_id": "2",
								"location_id": "2",
								"day": "2020-11-09",
								"start_time": "09:00",
								"end_time": "12:00"
							},
							{
								"day_id": "7",
								"date_id": "2",
								"location_id": "2",
								"day": "2020-11-10",
								"start_time": "09:00",
								"end_time": "12:00"
							},
							{
								"day_id": "8",
								"date_id": "2",
								"location_id": "2",
								"day": "2020-11-11",
								"start_time": "09:00",
								"end_time": "12:00"
							},
							{
								"day_id": "9",
								"date_id": "3",
								"location_id": "1",
								"day": "2020-11-13",
								"start_time": "09:00",
								"end_time": "12:00"
							},
							{
								"day_id": "10",
								"date_id": "3",
								"location_id": "2",
								"day": "2020-11-14",
								"start_time": "09:00",
								"end_time": "12:00"
							},
							{
								"day_id": "11",
								"date_id": "3",
								"location_id": "1",
								"day": "2020-11-15",
								"start_time": "09:00",
								"end_time": "12:00"
							},
							{
								"day_id": "12",
								"date_id": "3",
								"location_id": "2",
								"day": "2020-11-16",
								"start_time": "11:00",
								"end_time": "12:00"
							},
							{
								"day_id": "13",
								"date_id": "4",
								"location_id": "1",
								"day": "2020-11-19",
								"start_time": "09:00",
								"end_time": "18:00"
							}
						]
					})
	

	/*"location_id": "1",
	"name": "muster-stadtteilzentrum",
	"title": "Muster StadtTeilZentrum",
	"subtitle": "Ein Ort für viele.",
	"description": "Dieses ist die Beschreibung für ein Stadtteilzentrum.",
	"street": "Musterstraße 45",
	"zipcode": "12345",
	"town": "Musterstadt",
	"url": "http://home.tpl",
	"latitude": "52.531677",
	"longitude": "13.381777"*/

	let items = data.locations.map( location => {
				return 	{							
							title: 			location.name,
							brief:			{de: location.subtitle},
							description:	location.description,
							address:		location.street,
							zip:			location.zipcode,
							city:			location.town,
							latitude:		location.latitude,
							longitude:		location.longitude,
							tags:			['location'],

							remoteItem: {
								type: 	'raumplaner',
								source: 'unknown-source',
								url:	location.url
							}
						}
			})

	return items
}