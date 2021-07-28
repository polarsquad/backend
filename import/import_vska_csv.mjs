import	{	writeFileSync		}	from 'fs'
import	{	readFileSync		}	from 'fs'



function clearString(str){
	return str.replace('"','').trim()
}

const stz_csv = readFileSync('./vska_stadtteilzentren.csv', 'utf8')
const stz_raw = csv.split('\n')

const stz_items = stz_raw.map( row => {
	const data = row.split(',')

	const title 		= clearString(data[1])
	const position		= clearString(data[4])
	const contact 		= clearString(data[2])+" "+clearString(data[3])+ (position ? `(${position})` : '')
	const address		= clearString(data[5]) 
	const zip			= clearString(data[6])
	const city			= clearString(data[7])
	const phone			= clearString(data[8])
	const email			= clearString(data[9])
	const website		= clearString(data[10])


	//todo lat/lon
	//todo tags, categories

	const state		= 'public'

	return {
		title,
		contact,
		address,
		zip,
		city,
		phone,
		email,
		website
	}

})


// [
//     '"Organisation"',
//     '"Nachbarschaftshaus"',
//     '"Vorname"',
//     '"Nachname"',
//     '',
//     '"Straße"',
//     '"Postleitzahl"',
//     '"Ort"',
//     '"Telefon"',
//     '"E-Mail-Adresse"',
//     '"Webseite"'
//   ],

