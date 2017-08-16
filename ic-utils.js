var nodemailer  = require('nodemailer')
	path		= require('path')

exports.config	= JSON.parse(require('fs').readFileSync(path.resolve('../config/config.json'), 'utf8'));

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

exports.mail = function(to, subject, content){

	var transporter = nodemailer.createTransport({
		host: 	this.config.mail.host,
		port: 	this.config.mail.port,
		secure: this.config.mail.secure, 
		auth: 	{
					user: this.config.mail.user,
					pass: this.config.mail.pass
				}
	})

	var mailOptions = {
	    from: 		this.config.mail.from,
	    to: 		to, 
	    subject: 	subject, 
	    text: 		content
	};

	transporter.sendMail(mailOptions, (error, info) => {
	    if (error) {
	        return console.log(error);
	    }
	    console.log('Message %s sent: %s', info.messageId, info.response);
	});
}