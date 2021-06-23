cancelUnless(internal, "Unauthorized", 401)


$addCallback()
dpd.options.get({tag: this.tag})
.then( 

	items => {
		if(items.length > 0) cancel("Duplicate tag", 400)
		$finishCallback()	
	},

	$finishCallback
)