cancelUnless(internal || me && (this.user == me.id) || this.public, "Unauthorized", 401)

emit("lists:update", this.id) //only sending id, because of access restrctions