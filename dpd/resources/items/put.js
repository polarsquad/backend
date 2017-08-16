cancelUnless(
    me && me.privileges.indexOf('edit_items') != -1, 
    "You are not authorized.", 401
)


this.lastEditDate   = new Date().getTime()
this.lastEditor     = me.id