cancelUnless(internal || me && (this.user == me.id), "Unauthorized", 401)

emit("lists:deletion", this.id) ////only sending id, because of access restrctions