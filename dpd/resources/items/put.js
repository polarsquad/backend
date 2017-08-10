cancelUnless(me, "You are not authorized. Unregistered users can only submit suggestions.", 401)


this.lastEditDate   = new Date().getTime()
this.lastEditor     = me.id