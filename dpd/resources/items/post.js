cancelUnless(me || this.state == 'suggestion', "You are not authorized. Unregistered users can only submit suggestions.", 401);

this.creationDate   = new Date().getTime()
this.creator        = me.id