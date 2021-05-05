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

	//properties

	var noop = function(){}

	function Property(data){
		this.name 			= 	data.name
		this.defaultValue 	= 	data.defaultValue
		this.type			= 	data.type || exports.utils.getType(data.defaultValue)
		this.options		=	data.options
		this.searchable		=	data.searchable
		this.translatable	=	data.translatable
		this.min			=	data.min
		this.max			=	data.max
		this.mandatory		= 	data.mandatory
		this.match			=	data.match
		this.internal		=	data.internal

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
																		.some(function(k){ return !!value[k] })

										if(!at_least_one_key_ready && self.mandatory){
											return 	{
														message: 	self.name + " needs at least one entry.",
														code:		"MISSING_ENTRY"	
													}
										}


										for (var k in value){

											if(key && key != k) continue
											if(length_error)	continue
											if(!value[k])		continue


											length_error = exports.utils.getLengthError(self, value, k)
										}

									} else {
										length_error = exports.utils.getLengthError(self, value)
									}


									if(length_error) return length_error
									
									return	(data.getErrors || noop).call(self, value, key)


								}

	}

	/* CONFIG */
	/* Setup will add config data at this place and copy to /public so that backend and frontend can use the same file */
	/* CONFIG */	

}(
	('undefined' !== typeof exports) 
	? exports
	: (this['ic'] = this['ic'] || {})['itemConfig'] = (this['ic']['itemConfig'] || {})
))