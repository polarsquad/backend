cancelUnless(internal || me , "Unauthorized", 401)

this.user = me.id

this.items = this.items || []

emit("lists:creation", this.id) //only sending id, because of access restrctions