(function(exports){

	"use strict";



	//utils

	exports.utils = {}

	exports.utils.getType = function(val){
		var matches = Object.prototype.toString.call(val).match(/\[object\s(.*)\]/)
		return matches && matches[1].toLowerCase()
	}

	exports.utils.getTypeError = function(property, value){

		var type_error = false

		if(property.type == 'number'){
			type_error = isNaN(parseFloat(value))
		}else{
			type_error = exports.utils.getType(value) != property.type
		}

		return 	type_error
				?	{
						message: 	"Invalid type: expected "+property.type+" got "+exports.utils.getType(value)+" instead.",
						code:		"INVALID_TYPE"
					}
				:	null
	}

	exports.utils.getLengthError = function(property, value, key){

		value =	key
				?	value[key]
				:	value


		if(property.min !== undefined && value.replace(/\s/, '').length < property.min) return {
			message: 	"Invalid length. Min length for "+ property.name +" is "+property.min+'.',
			code:		"INVALID_LENGTH_MIN",
			key:		key,
		}

		if(property.max !== undefined && value.length > property.max) return {
			message: 	"Invalid length. Max length for "+ property.name +" is "+property.max+'.',
			code:		"INVALID_LENGTH_MAX",
			key:		key
		}

		return null

	}

	exports.collectionName = "items"



	//properties

	var noop = function(){}

	function Property(data){
		this.name 			= 	data.name
		this.defaultValue 	= 	data.defaultValue
		this.type			= 	exports.utils.getType(data.defaultValue)
		this.options		=	data.options
		this.searchable		=	data.searchable
		this.min			=	data.min
		this.max			=	data.max
		this.mandatory		= 	data.mandatory
		
		this.getErrors		= 	function(value, key){
									var self = this

									if(self.internal) return 	{
																	message: 	self.name + " cannot be modified manually.",
																	code:		"INTERNAL_PROPERTY"
																}


									if(!value && !self.mandatory) 										return null
									if(self.type == 'object' && key && !value[key] && !self.mandatory)	return null

									var type_error = exports.utils.getTypeError(self, value)

									if(type_error) return type_error


									var length_error = undefined

									if(self.type == 'object'){
										var at_least_one_key_ready = 	Object.keys(value)
																		.reduce(function(s, key){
																			return s || value[key]
																		}, false)


										if(!at_least_one_key_ready && self.mandatory){
											return 	{
														message: 	self.name + " needs at least one entry.",
														code:		"MISSING_ENTRY"	
													}
										}

										for (var k in value){

											if(key && key != k) continue
											if(length_error)	continue
											if(!value[key])		continue

											console.log(value, k)

											length_error = exports.utils.getLengthError(self, value, k)
										}

									} else {
										length_error = exports.utils.getLengthError(self, value)
									}


									if(length_error) return length_error
									
									return	(data.getErrors || noop).call(self, value, key)


								}

	}

	exports.properties = [
		new Property({
			name: 			"title",
			getErrors:		function(value){

							},	
			defaultValue:	"",
			min:			3,
			max:			80,
			searchable:		true,
			mandatory:		true
		}),		
		new Property({
			name: 			"image",
			getErrors:		function(value){

							},	
			defaultValue:	"",
		}),	
		new Property({
			name: 			"state",
			getErrors:		function(value){
								if(this.options.indexOf(value) == -1) return {
									message:	"Invalid value: "+ value +". Valid values are: "+this.options.join(', ')+".",
									code:		"INVALID_VALUE"
								}

							},	
			defaultValue:	"draft",
			options:		[
								'public',
								'draft',
								'archived',
								'suggestion'
							],
			mandatory:		true
		}),
		new Property({
			name: 			"tags",
			getErrors:		function(values){
								// var invalid_tags = values.filter(function(value){ return this.options.indexOf(value) == -1 })
								// if(invalid_tags.length != 0) return {
								// 	message:	"Invalid values: "+ invalid_values.join('')+". Valid values are: "+this.options.join(',')+".",
								// 	code:		"INVALID_VALUE"
								// }

							},
			defaultValue:	[]	
		}),
		new Property({
			name: 			"brief",
			getErrors:		function(obj, key){	
								

							},	
			defaultValue:	{},
			mandatory:		true,
			min:			3,
			max:			120,
			searchable:		true,
		}),

		new Property({
			name: 			"description",
			getErrors:		function(obj, key){		
							},	
			defaultValue:	{},
			searchable:		true,
			min:			0,
			max:			600
		}),

		new Property({
			name: 			"location",
			getErrors:		function(value, key){	
							},	
			defaultValue:	"",
			searchable:		true,
		}),

		new Property({
			name: 			"address",
			getErrors:		function(value, key){		
								var min_length = 3,
									max_length = 30

								if(value.replace(/\s/, '').length < min_length) return {
									message: 	"Invalid length. Min length for "+ this.name +" is "+min_length+".",
									code:		"INVALID_LENGTH_MIN"
								}

								if(value.length > max_length) return {
									message: 	"Invalid length. Max length for "+ this.name +" is "+max_length+".",
									code:		"INVALID_LENGTH_MAX"
								}
							},	
			defaultValue:	"",
			searchable:		true,
		}),

		new Property({
			name: 			"zip",
			getErrors:		function(value, key){		
								var min_length = 3,
									max_length = 10

								if(value.replace(/\s/, '').length < min_length) return {
									message: 	"Invalid length. Min length for "+ this.name +" is "+min_length+".",
									code:		"INVALID_LENGTH_MIN"
								}

								if(value.length > max_length) return {
									message: 	"Invalid length. Max length for "+ this.name +" is "+max_length+".",
									code:		"INVALID_LENGTH_MAX"
								}
							},	
			defaultValue:	"",
			searchable:		true,
		}),

		new Property({
			name: 			"city",
			getErrors:		function(value, key){		
								var min_length = 3,
									max_length = 30

								if(value.replace(/\s/, '').length < min_length) return {
									message: 	"Invalid length. Min length for "+ this.name +" is "+min_length+".",
									code:		"INVALID_LENGTH_MIN"
								}

								if(value.length > max_length) return {
									message: 	"Invalid length. Max length for "+ this.name +" is "+max_length+".",
									code:		"INVALID_LENGTH_MAX"
								}
							},	
			defaultValue:	"Berlin",
			searchable:		true,
		}),

		new Property({
			name: 			"latitude",
			getErrors:		function(value, key){		
							},	
			defaultValue:	0,
		}),

		new Property({
			name: 			"longitude",
			getErrors:		function(value, key){		
							},	
			defaultValue:	0,
		}),


		new Property({
			name: 			"website",
			getErrors:		function(value, key){		
								if(!value.match(/^https?:\/\/.+/)) return{
									message:	"Website url must start with http(s).",
									code:		"INVALID_PROTOCOL"
								}
							},	
			defaultValue:	"",
			searchable:		true,
		}),

		new Property({
			name: 			"email",
			getErrors:		function(value, key){		
								var min_length = 3,
									max_length = 60

								if(!value.match(/^.+@.+\..+/)) return{
									message:	"Emails must have at least one '@' and one '.' .",
									code:		"INVALID_FORMAT"
								}

								if(value.replace(/\s/, '').length < min_length) return {
									message: 	"Invalid length. Min length for "+ this.name +" is "+min_length+".",
									code:		"INVALID_LENGTH_MIN"
								}

								if(value.length > max_length) return {
									message: 	"Invalid length. Max length for "+ this.name +" is "+max_length+".",
									code:		"INVALID_LENGTH_MAX"
								}
							},	
			defaultValue:	"",
			searchable:		true,
		}),

		new Property({
			name: 			"facebook",
			getErrors:		function(value, key){		

								var min_length = 3,
									max_length = 60

								if(value.replace(/\s/, '').length < min_length) return {
									message: 	"Invalid length. Min length for "+ this.name +" is "+min_length+".",
									code:		"INVALID_LENGTH_MIN"
								}

								if(value.length > max_length) return {
									message: 	"Invalid length. Max length for "+ this.name +" is "+max_length+".",
									code:		"INVALID_LENGTH_MAX"
								}
							},	
			defaultValue:	"",
			searchable:		true,
		}),



		new Property({
			name: 			"twitter",
			getErrors:		function(value, key){		
								var min_length = 3,
									max_length = 60

								if(value.replace(/\s/, '').length < min_length) return {
									message: 	"Invalid length. Min length for "+ this.name +" is "+min_length+".",
									code:		"INVALID_LENGTH_MIN"
								}

								if(value.length > max_length) return {
									message: 	"Invalid length. Max length for "+ this.name +" is "+max_length+".",
									code:		"INVALID_LENGTH_MAX"
								}
							},	
			defaultValue:	"",
			searchable:		true,
		}),



		new Property({
			name: 			"whatsapp",
			getErrors:		function(value, key){		
								var min_length = 3,
									max_length = 60

								if(value.replace(/\s/, '').length < min_length) return {
									message: 	"Invalid length. Min length for "+ this.name +" is "+min_length+".",
									code:		"INVALID_LENGTH_MIN"
								}

								if(value.length > max_length) return {
									message: 	"Invalid length. Max length for "+ this.name +" is "+max_length+".",
									code:		"INVALID_LENGTH_MAX"
								}
							},	
			defaultValue:	"",
			searchable:		true,
		}),

		new Property({
			name: 			"contact",
			getErrors:		function(value, key){		
								var min_length = 3,
									max_length = 60

								if(value.replace(/\s/, '').length < min_length) return {
									message: 	"Invalid length. Min length for "+ this.name +" is "+min_length+".",
									code:		"INVALID_LENGTH_MIN"
								}

								if(value.length > max_length) return {
									message: 	"Invalid length. Max length for "+ this.name +" is "+max_length+".",
									code:		"INVALID_LENGTH_MAX"
								}
							},	
			defaultValue:	"",
			searchable:		true,
		}),

		new Property({
			name: 			"phone",
			getErrors:		function(value, key){		
								var min_length = 3,
									max_length = 60

								if(value.replace(/\s/, '').length < min_length) return {
									message: 	"Invalid length. Min length for "+ this.name +" is "+min_length+".",
									code:		"INVALID_LENGTH_MIN"
								}

								if(value.length > max_length) return {
									message: 	"Invalid length. Max length for "+ this.name +" is "+max_length+".",
									code:		"INVALID_LENGTH_MAX"
								}
							},	
			defaultValue:	"",
			searchable:		true,
		}),

		new Property({
			name: 			"mobile",
			getErrors:		function(value, key){		
								var min_length = 3,
									max_length = 60

								if(value.replace(/\s/, '').length < min_length) return {
									message: 	"Invalid length. Min length for "+ this.name +" is "+min_length+".",
									code:		"INVALID_LENGTH_MIN"
								}

								if(value.length > max_length) return {
									message: 	"Invalid length. Max length for "+ this.name +" is "+max_length+".",
									code:		"INVALID_LENGTH_MAX"
								}
							},	
			defaultValue:	"",
			searchable:		true,
		}),

		new Property({
			name: 			"editingNote",
			getErrors:		function(value, key){	
									
							},	
			defaultValue:	"",
			searchable:		false,
		}),

		new Property({
			name: 			"startDate",
			getErrors:		function(value, key){	
								return 	isNaN(Date.parse(value))
										?	{
												message: 'Unable to convert string to date. Try YYYY-MM-DDTHH:MM',
												code:	 'INVALID_DATE_STRING'
											}
										:	null
							},
			searchable:		false,
			defaultValue:	""
		}),


		new Property({
			name: 			"endDate",
			getErrors:		function(value, key){	
								return 	isNaN(Date.parse(value))
										?	{
												message: 'Unable to convert string to date. Try YYYY-MM-DDTHH:MM',
												code:	 'INVALID_DATE_STRING'
											}
										:	null
							},	
			defaultValue:	"",
			searchable:		false,
		}),

		new Property({
			name: 			"hours",
			getErrors:		function(value, key){	
									
							},	
			defaultValue:	"",
			searchable:		true,
		}),

		new Property({
			name: 			"proposalFor",
			defaultValue:	"",
			internal:		true
		}),
		new Property({
			name: 			"creationDate",
			defaultValue:	0,
			internal:		true
		}),		
		new Property({
			name: 			"creator",
			defaultValue:	"",
			internal:		true
		}),
		new Property({
			name: 			"lastEditDate",
			defaultValue:	0,
			internal:		true
		}),
		new Property({
			name: 			"lastEditor",
			defaultValue:	"",
			internal:		true
		}),

	]
}(
	('undefined' !== typeof exports) 
	? exports
	: (this['ic'] = this['ic'] || {})['itemConfig'] = (this['ic']['itemConfig'] || {})
))