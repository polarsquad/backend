import 	{
			fetchGoogleSheets,
			getEffectiveValues,
			trimEffectiveValues
		} 							from '../ic-utils.js'

import	{	writeFileSync		}	from 'fs'


const out = process.argv[2]


function guessDistrict(str){

	const districts 	=	{
								mitte:						/Mitte/i,
								pankow:						/Pankow/i,
								spandau:					/Spandau/i,
								steglitz_zehlendorf:		/Steglitz-Zehlendorf/i,
								tempelhof_schoeneberg:		/Tempelhof-Schöneberg/i,
								neukoelln:					/Neukölln/i,
								treptow_koepenik:			/Treptow-Köpenick/i,
								marzahn_hellersdorf:		/Marzahn-Hellersdorf/i,
								lichtenberg:				/Lichtenberg/i,
								reinickendorf:				/Reinickendorf/i,
								charlottenburg_wilmersdorf:	/Charlottenburg-Wilmersdorf/i,
								friedrichshain_kreuzberg: 	/Friedrichshain-Kreuzberg/i
							}



	const result =	str.match(/berlinweit/i)
					?	Object.keys(districts)
					:	Object.keys(districts).filter( key => (str||'').trim().match(districts[key] ))

	if(result.length > 0) return result
	
	console.log('No matching district found: '+str)

}

function guessTargetGroups(str){

	const targetGroups 	= 	{
								senior_citizens:		/Ältere Menschen/i,
								families:				/Familien/i,
								women:					/Frauen/i,
								young:					/Kinder und Jugendliche/i,
								queer:					/Queere Menschen/i,
								men:					/Männer/i,
								disability_background:	/Menschen mit Behinderung/i,
								refugee_background:		/Menschen mit Fluchtgeschichte/i,
								migration_background:	/Menschen mit Migrationsgeschichte/i,
								houseless:				/Wohnungs- und obdachlose Menschen/i
							}	

	const result = Object.keys(targetGroups).filter( key => (str||'').trim().match(targetGroups[key] ))							

	if(result.length > 0) return result

	console.log('no matching target group found: '+ str)

	return []
}

function guessLanguage(str){
	const languages		=	{
								german:					/deutsch/i
							}

	const result = Object.keys(languages).filter( key => (str||'').trim().match(languages[key] ))							

	if(result.length > 0) return result

	console.log('No matching language found: '+str)						

	return []
}


function guessTopic(str){

	const topics		=	{
								health:					/Gesundheit/i,
								counseling:				/Beratung/i,
								financial_counseling:	/Schuldner- und Sozialberatung/i,
								legal_counseling:		/Rechtliche Beratung/i,
								offender_services:		/Straffälligenhilfe/i,
								sports:					/Bewegung und Sport/i,
								education:				/Bildung und Sprache/i,
								volunteer_work:			/Freiwilliges Engagement/i,
								addiction:				/Sucht/i,
								labour:					/Arbeit und Beschäftigung/i,
								neighborhood:			/Stadtteilarbeit und Nachbarschaft/i,
								arts:					/Kreativität und Kunst/i,
								victim_support:			/Opferhilfe/i,
								care:					/Pflege/i,
								self_help:				/Selbsthilfe/i,
								housing:				/Wohnen/i,
								recreation:				/Freizeit/i,
								hospice:				/Hospiz/i
							}

	const result = Object.keys(topics).filter( key => (str||'').trim().match(topics[key] ))							

	if(result.length > 0) return result	

	console.log('No matching topic found: '+str)

	return []
	
}

function guessAccessibilty(str){

	const accessiblity	=	{
								wheelchair:				/(Rollstuhlgerecht)|(Rollstuhl)/i,
								bathroom_accessible:	/Behindertengerechtes WC/i,
								physical_disability:	/körperliche Behinderung/i,
								mental_disability:		/Lernbehinderung \/ geistige Behinderung/i,
								mental_disability_2:	/psychische (seelische) Behinderung/i,
								sight_impaired:			/Blindheit und Sehbeeinträchtigung/i,
								hearing_impaired:		/Gehörlosigkeit und Schwerhörigkeit/i,
								deafblind:				/Taubblindheit/i,
								speech_impairment:		/Sprachbehinderung/i
							}


	const result = Object.keys(accessiblity).filter( key => (str||'').trim().match(accessiblity[key] ))							

	if(result.length > 0) return result	

	console.log('No matching accessibilty found: '+str)

	return []
}


function guessInstitutionType(str){
	const institution_types	=	{
									counseling_center:			/Beratungsstelle/i,
									educational_center:			/Bildungszentrum/i,
									youth_facility:				/Jugendeinrichtung/i,
									kindergarden:				/Kindergarten/i,
									cultural_center:			/Kulturzentrum/i,
									multigenerational_house:	/Mehrgenerationenhaus/i,
									neighborhood_house:			/Nachbarschaftshaus/i,
									emergency_shelter:			/Notunterkunft/i,
									self_help_contact_point:	/Selbsthilfe-Kontaktstelle/i,
									senior_citizen_meeting:		/Seniorenbegegnungsstätte/i,
									district_center:			/Stadtteilzentrum/i,
									meeting_center:				/Begegnungszentrum/i,
									assisted_living:			/Betreutes Wohnen/i,
									retirement_home:			/Seniorenheim/i,
									nursing_home:				/Pflegeheim/i
								}

	const result = Object.keys(institution_types).filter( key => (str||'').trim().match(institution_types[key] ))							

	if(result.length > 0) return result	

	console.log('No matching institution type found: '+str)		

	return []						
}


function streamlinePhone(str){

	if(str == undefined) return undefined

	return 	(str||'')
			.replace(/^00/g, '+')
			.replace(/\s/g, '')
}


function mapItem(row){

	console.dir(row)

	let tags			=	[]

	const title 		=	row[0]
	const brief			=	{de: row[1]}
	const description	=	{de: row[2]}
	const primaryTopic	=	guessTopic(row[5])[0]

	tags.push(primaryTopic)
	tags.push(...guessTopic(row[6]))
	tags.push(...guessTopic(row[7]))

	tags.push(...guessTargetGroups(row[8]))
	tags.push(...guessTargetGroups(row[9]))

	tags.push(...guessLanguage(row[10]))

	tags.push(...guessAccessibilty(row[11]))

	tags.push(...guessInstitutionType(row[12]))

	tags.push(...guessDistrict(row[13]))


	const location		=	[
								(row[15]||'').trim(),
								(row[17]||'').trim()
							].filter( x => !!x).join('\n')
	const address		=	row[16]
	const zip			=	row[18]
	const city			=	row[19]


	const responsible	=	(row[14]||'').trim()

	const service_hours_de = 	(row[23]||'').trim() && 'Angebotszeiten: \n'+(row[23]||'').trim() || ''
	const contact_hours_de	=	(row[27]||'').trim() && 'Kontakt- oder Öffnungszeiten: \n'+(row[27]||'').trim() || ''


	const hours			= 	{de: (service_hours_de+'\n\n'+contact_hours_de).trim()}
	const email			=	row[25]
	const contact		=	row[26]
	const phone			=	streamlinePhone(row[28])
	const mobile		=	streamlinePhone(row[30])
	const website		=	row[31]
	const facebook		=	row[32]

	const twitter		=	row[35]

	const image			=	row[39]


	console.log(row[41], row[42])

	const latitude		= 	parseFloat(row[41])
	const longitude		= 	parseFloat(row[42])

	const state			=	'public'

	tags	=	Array.from(new Set(tags))

	return {
				title, 
				brief, 
				description, 
				primaryTopic, 
				address, 
				location, 
				zip, 
				city, 
				latitude,
				longitude,
				responsible,
				hours, 
				email, 
				contact, 
				phone, 
				mobile, 
				website, 
				facebook, 
				twitter, 
				image, 
				tags,
				state
			}

}




fetchGoogleSheets('1zXs4Q0kCkvamNTAtmLZWIRDh0FcKnkIKRiz3PJtaBDc','AIzaSyDJqrD86YpMWG0brzu3Hc3UMt65Y_sLUn4')
.then( sheets 			=> getEffectiveValues(sheets[0]))
.then( effective_values	=> effective_values.slice(3) )
.then( values			=> values.map(mapItem) )
.then(
	items => {		
		console.log(items),
		console.log(items[0])

		if(out) writeFileSync(out, JSON.stringify(items), 'utf8')
	},
	console.log
)










