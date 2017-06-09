var fs				= require('fs'),
	parsingErrors 	= []


$addCallback()


icUtils.get(icConfig.translationSpreadsheetUrl)
.then(
	function(data){

		if(!data.sheets || !data.sheets.length) return parsingErrors.push('Missing sheets.')


		var sheets = data.sheets.map( sheet => {
			var result 	= {}

			result.data	= []

			if(!sheet.properties || !sheet.properties.title) return parsingErrors.push('Missing sheet title.')
			result.title = sheet.properties.title

			if(!sheet.data || !sheet.data.length || !sheet.data[0].rowData) return parsingErrors.push('rowData missing: '+result.title+'.')
			
			sheet.data[0].rowData.forEach( row => {

				var row_data = row.values.map( value => value.effectiveValue && value.effectiveValue.stringValue )

				if(row_data[0]) result.data.push(row_data)
			})
			
			return result

		})

		var translationTable = {}


		console.log('sheets:', sheets.length)

		sheets.forEach( sheet => {
			var	section	= (sheet.title || '').toUpperCase().replace(/\s/g, "_")
			if(!section) return null

			sheet.data.forEach( (row, row_index) => {
				var id = row[0].toUpperCase()
				if(row_index != 0){
					row.forEach( (value, col_index) => {
						if(col_index != 0){
							var language 	= (sheet.data[0][col_index] || '') .toUpperCase()


							if(!language) return null

							translationTable[language] 				= translationTable[language] 			|| {}
							translationTable[language][section] 	= translationTable[language][section] 	|| {}
							translationTable[language][section][id]	= value
						}
					})
				}
			})
		})


		return	fs.writeFile('public/translations.json', JSON.stringify(translationTable), 'utf8', function(err){
					if(err){
						ctx.done(err)
					} else {
						setResult('Translations updated.')
						$finishCallback()
					}
				})
	},
	function(){
		ctx.done('Unable to fetch spreadsheet data.')
	}
)

