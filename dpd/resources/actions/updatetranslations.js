cancelUnless( 
        internal
    ||  (me && me.privileges.indexOf('edit_items') != -1),
    "unauthorized", 401
)

var fs				= require('fs'),
	parsingErrors 	= []


$addCallback()



const sheet_credentials = 	icConfig.translationSpreadsheet
				?	[ icConfig.translationSpreadsheet.id, icConfig.translationSpreadsheet.apiKey ]
				:	icUtils.splitSpreadsheetUrl(icConfig.translationSpreadsheetUrl)

icUtils.updateInterfaceTranslations(...sheet_credentials)
.then(

	translationTable => {

		fs.writeFile('public/translations.json', JSON.stringify(translationTable), 'utf8', function(err){
			if(err){
				ctx.done(err)
			} else {
				setResult('Translations updated.')
				$finishCallback()
			}
		})
	},

	e => {
		console.log(e)
		ctx.done('Unable to fetch spreadsheet data.')
	}
)

