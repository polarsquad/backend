cancelUnless(internal || me && (this.user == me.id) || this.public, "Unauthorized", 401)

emit("lists:deletion", this) ////only sending id, because of access restrctions