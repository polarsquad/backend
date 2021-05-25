import	{	writeFileSync		}	from 'fs'
import	{	readFileSync		}	from 'fs'




const out = process.argv[2]

function clearString(str){
	return str.replace('"','').trim()
}


const csv 	= readFileSync('./awo.csv', 'utf8')
const raw 	= CSVToArray(csv,',')


/**
 * CSVToArray parses any String of Data including '\r' '\n' characters,
 * and returns an array with the rows of data.
 * @param {String} CSV_string - the CSV string you need to parse
 * @param {String} delimiter - the delimeter used to separate fields of data
 * @returns {Array} rows - rows of CSV where first row are column headers
 */
function CSVToArray (CSV_string, delimiter) {
   delimiter = (delimiter || ","); // user-supplied delimeter or default comma

   var pattern = new RegExp( // regular expression to parse the CSV values.
     ( // Delimiters:
       "(\\" + delimiter + "|\\r?\\n|\\r|^)" +
       // Quoted fields.
       "(?:\"([^\"]*(?:\"\"[^\"]*)*)\"|" +
       // Standard fields.
       "([^\"\\" + delimiter + "\\r\\n]*))"
     ), "gi"
   );

   var rows = [[]];  // array to hold our data. First row is column headers.
   // array to hold our individual pattern matching groups:
   var matches = false; // false if we don't find any matches
   // Loop until we no longer find a regular expression match
   while (matches = pattern.exec( CSV_string )) {
       var matched_delimiter = matches[1]; // Get the matched delimiter
       // Check if the delimiter has a length (and is not the start of string)
       // and if it matches field delimiter. If not, it is a row delimiter.
       if (matched_delimiter.length && matched_delimiter !== delimiter) {
         // Since this is a new row of data, add an empty row to the array.
         rows.push( [] );
       }
       var matched_value;
       // Once we have eliminated the delimiter, check to see
       // what kind of value was captured (quoted or unquoted):
       if (matches[2]) { // found quoted value. unescape any double quotes.
        matched_value = matches[2].replace(
          new RegExp( "\"\"", "g" ), "\""
        );
       } else { // found a non-quoted value
         matched_value = matches[3];
       }
       // Now that we have our value string, let's add
       // it to the data array.
       rows[rows.length - 1].push(matched_value);
   }
   return rows; // Return the parsed data Array
}

function getCategories(str){

	return undefined
}

function getTargetGroups(str){

	return undefined

}

function getInstitutionType(str){

	return undefined

}

function getBoolean(str){

	return undefined

}

function getDistrict(str){
	return undefined
}

function getPGR(str){
	return undefined
}


function getBZR(str){
	return undefined
}

function getLanguages(str){
	return undefined
}



const items	= raw.slice(5).map( data => {	

	const type						= 	data[0]
	const institutionName			= 	data[1] //??
	const title						= 	data[2] || institutionName
	const brief						= 	{de:data[3]}
	const description				= 	{de:data[4]}
	const charge					= 	{de:data[5]}

	const acessibility				=	{de:data[15]}

	const primaryTopic				= 	getCategories(data[6])[0]

	const address					=	data[20]
	const location					=	data[21]
	const zip						=	data[22]
	const city						=	data[23]

	const website					=	data[24]
	const hours						=	data[25]
	const email						=	data[26]
	const contact					=	data[27]
	const phone						=	data[28]
	const mobile					=	data[29]
	const facebook					=	data[30]
	const twitter					=	data[31]
	const whatsapp					=	data[32]
	const nebenanDe					=	data[33]

	//tags:

	const subCategories				= 	getCategories(data[7])
	const extraCategories			= 	getCategories(data[8])

	const targetGroups				= 	getTargetGroups(data[9])
	const institutionType			=	getInstitutionType(data[10])

	const accessibleWC 				=	getBoolean(data[11])
	const accessibleParking			=	getBoolean(data[12])
	const accessibleEntrance		=	getBoolean(data[13])
	const elevator					=	getBoolean(data[14])


	const bezirk					=	getDistrict(data[16])
	const prognoseraum				=	getPGR(data[17])
	const bezirksregion				=	getBZR(data[18])

	const venue						=	data[19] //todo


	const languages					=	getLanguages(data[34])

	const freeWifiUse				=	getBoolean(data[35])
	const freePCUse					=	getBoolean(data[36])


	//TODO
	const responsibleInstituation	=	data[37]
	const sponsors					=	[data[38]]


	//TODO
	const tags						= 	[
											primaryTopic, 
											...subCategories, 
											...extraCategories, 
											...targetGroups,
											institutionType,
											bezirk,
											prognoseraum,
											bezirksregion,
											...languages
										]



	// const title 			= clearString(data[1])
	// const position		= clearString(data[4])
	// const contact 		= clearString(data[2])+" "+clearString(data[3])+ (position ? `(${position})` : '')
	// const address		= clearString(data[5]) 
	// const zip			= clearString(data[6])
	// const city			= clearString(data[7])
	// const phone			= clearString(data[8])
	// const email			= clearString(data[9])
	// const website		= clearString(data[10])


	//todo lat/lon
	//todo tags, categories

	const state		= 'public'

	return {
		type,
		institutionName,
		title,
		brief,
		description,
		charge,
		primaryTopic,
		acessibility,
		venue,
		address,
		location,
		zip,
		city,
		website,
		hours,
		email,
		contact,
		phone,
		mobile,
		facebook,
		twitter,
		whatsapp,
		nebenanDe,
		responsibleInstituation,
		sponsors,


		tags,
		state

	}

})

console.log(items.slice(0,5))

if(out) writeFileSync(out, JSON.stringify(items), 'utf8')
