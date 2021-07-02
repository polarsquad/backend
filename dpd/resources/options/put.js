cancelUnless(internal || me && me.privileges.includes('edit_options'), "Unauthorized", 401)



$addCallback()

dpd.options.get({tag: this.tag})
.then( 

	options => {
		if(options.length == 0) finishCallback()

		if(options[0].id != this.id) cancel("Duplicate tag: "+this.tag, 400)

		$finishCallback()	
	},

	$finishCallback
)