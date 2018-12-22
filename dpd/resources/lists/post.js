cancelUnless(internal || me , "Unauthorized", 401)

this.user = me.id

emit("lists:creation", this)