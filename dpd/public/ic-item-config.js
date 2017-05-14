(function(exports){

	"use strict";



	//utils

	exports.utils = {}

	exports.utils.getType = function(val){
		var matches = Object.prototype.toString.call(val).match(/\[object\s(.*)\]/)
		return matches && matches[1].toLowerCase()
	}

	exports.utils.getTypeError = function(property, value){
		return 	exports.utils.getType(value) == property.type
				?	null
				:	{
						message: 	"Invalid type: expected "+property.type+" got "+exports.utils.getType(value)+" instead.",
						code:		"INVALID_TYPE"
					}									
	}


	//states

	exports.states = [
		'public',
		'draft',
		'archived'
	]


	exports.collectionName = "items"



	//properties

	var noop = function(){}

	function Property(data){
		this.name 			= 	data.name
		this.defaultValue 	= 	data.defaultValue
		this.type			= 	exports.utils.getType(data.defaultValue)
		this.options		=	data.options
		this.searchable		=	data.searchable
		
		this.getErrors		= 	function(value){

									if(this.internal) return 	value === undefined
																?	null
																:	{
																		message: 	this.name + " may be modified manually.",
																		code:		"INTERNAL_PROPERTY"
																	}

									var error = exports.utils.getTypeError(this, value)
									
									if(error) return error
									return (data.getErrors || noop).call(this)
								}

	}

	exports.tags = [
				'information',
				"helpdesk",
				"visiting",
				"counseling",
				"care",
				"provision",
				"will",
				'goods',
				"chemist",
				"store",
				"delivery",
				"market",
				"health_food",
				"pharmacy",
				"physician",
				"doctors_office",
				"nutrition_counseling",
				"discussion_group",
				"alternative_practitioner",
				"hospital",
				"health_food",
				"rehabilitation",
				"medical_service",
				"self_help",
				'culture_leisure',
				"handicraft",
				"library",
				"learning_opportunity",
				"festival",
				"commitment",
				"needlework",
				"mobile_cinema",
				"music",
				"travel",
				"senior_leisure_center",
				"games",
				"language_course",
				"city_culture",
				"dancing",
				'mv',
				"mailbox",
				"coffee shop",
				"guest_apartment",
				"atm",
				"hotel",
				"church",
				"neighborhood_floor",
				"break_point",
				"post_office",
				"restaurant",
				"meeting_places",
				"wifi_hotspot",
				'mobility',
				"accompanying_service",
				"benches",
				"resting_place",
				"public_transport",
				"taxi_stand",
				'care',
				"health_care",
				"visiting_service",
				"neighborhood_assistance",
				"meals_on_wheels",
				"therapists",
				"utilities",
				"medical_supplies",
				"emergency_call",
				"chiropody",
				"cosmetics",
				"pigeons",
				"cleaning",
				"computer",
				"funeral",
				"food_delivery",
				"craftsperson",
				"optician",
				"sanitary",
				"vet",
				"dog_care",
				"pets",
				"animal_care",
				"finances",
				"locksmith",
				"disposal",
				"hairdresser",
				"cabs",
				"lavatory",
				"memento_mori",
				"burglary_protection",
				'sports',
				"indoor_swimming",
				"sports_club",
				"sports_course",
				"public_toilets",
				"nordic_walking", 
				"chair_gymnastics",
				"seniors_playground",
				"rehabilitation",
				"community_college",
				"dancing",
				"craftsmen",
				"relocation_assistance",
				"burglary protection",
				"gesobau",
				"household_help",
				"nursing home",
				"guest_apartment",
				"disposal",
				"senior_accomodation",
				'location',
				'event',
				'service',
				'information',
	]

	exports.properties = [
		new Property({
			name: 			"title",
			getErrors:		function(value){
								if(value.replace(/\s/, '').length < 3) return {
									message: 	"Invalid length. Min length for "+ this.name +" is 3.",
									code:		"INVALID_LENGTH_MIN"
								}

								if(value.length > 30) return {
									message: 	"Invalid length. Max length for "+ this.name +" is 30.",
									code:		"INVALID_LENGTH_MAX"
								}

							},	
			defaultValue:	"",
			searchable:		true,
		}),		
		new Property({
			name: 			"state",
			getErrors:		function(values){
								var invalid_tags = values.filter(function(value){ return this.options.indexOf(value) == -1 })
								if(invalid_tags.length != 0) return {
									message:	"Invalid values: "+ invalid_values.join('')+". Valid values are: "+this.options.join(',')+".",
									code:		"INVALID_VALUE"
								}

							},	
			defaultValue:	"draft",
			options:		exports.states
		}),
		new Property({
			name: 			"tags",
			getErrors:		function(values){
								var invalid_tags = values.filter(function(value){ return this.options.indexOf(value) == -1 })
								if(invalid_tags.length != 0) return {
									message:	"Invalid values: "+ invalid_values.join('')+". Valid values are: "+this.options.join(',')+".",
									code:		"INVALID_VALUE"
								}

							},
			defaultValue:	[]	
		}),
		new Property({
			name: 			"brief",
			getErrors:		function(obj, key){		
								function keyErrors(key){
									if(typeof obj[key] != 'string') return {
										message:	"Invalid type: "+this.name+"." + key + "must be a string. Got: " + typeof obj[key] +".",
										code:		"INVALID_TYPE",
										key:		key
									}

									if(obj[key] > 100) return {
										message: 	"Invalid length. Max length for "+ this.name +" is 100.",										
										code:		"INVALID_VALUE",
										key:		key
									}	

								}

								if(key){
									return keyErrors(key)
								} else {
									for(key in obj){
										if(error = keyError(key)) return error
									}
								}

							},	
			defaultValue:	{},
			searchable:		true,
		}),

		new Property({
			name: 			"description",
			getErrors:		function(obj, key){		
								function keyErrors(key){
									var max_length = 600

									if(typeof obj[key] != 'string') return {
										message:	"Invalid type: "+this.name+"." + key + "must be a string. Got: " + typeof obj[key] +".",
										code:		"INVALID_TYPE",
										key:		key
									}

									if(obj[key] > max_length) return {
										message: 	"Invalid length. Max length for "+ this.name +" is "+max_length+".",										
										code:		"INVALID_VALUE",
										key:		key
									}	

								}

								if(key){
									return keyErrors(key)
								} else {
									for(key in obj){
										if(error = keyError(key)) return error
									}
								}

							},	
			defaultValue:	{},
			searchable:		true,
		}),

		new Property({
			name: 			"location",
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
			defaultValue:	"",
			searchable:		true,
		}),

		new Property({
			name: 			"website",
			getErrors:		function(value, key){		
								var min_length = 3,
									max_length = 60

								if(!value.match(/^https?:\/\/.+/)) return{
									message:	"Website url must start with http(s).",
									code:		"INVALID_PROTOCOL"
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
			name: 			"startDate",
			getErrors:		function(value, key){	
									
							},	
			defaultValue:	0,
			searchable:		true,
		}),


		new Property({
			name: 			"endDate",
			getErrors:		function(value, key){	
									
							},	
			defaultValue:	0,
			searchable:		true,
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