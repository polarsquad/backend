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


	//tags

	exports.tags = [
		"information",
		"law",
		"places",
		"support",
		"health",
		"work",
		"education",
		"social",
		"leisure",
		"culture",
		"city",
		"services",
		"events"
	]


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
			defaultValue:	[],
			options:		exports.tags
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