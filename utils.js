exports.get = function(url){

	if(!url) console.error('utils.get: missing url')

	var http = url.startsWith('https') ? require('https') : require('http')

	return new Promise( (resolve, reject) => {
				
		var request = 	http.get(url,  response => {

							response.setEncoding('utf8')

							if(response.statusCode < 200 || response.statusCode > 299) {
								reject(new Error('Failed to load page, status code: ' + response.statusCode))
							}

							var body = [];

							response.on('data', (chunk) => body.push(chunk));
							response.on('end', () => resolve(JSON.parse(body.join(''))));
						})


		request.on('error', (err) => reject(err))

	})
}