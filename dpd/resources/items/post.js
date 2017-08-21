cancelUnless( 
        (me && me.privileges.indexOf('edit_items') != -1) 
    ||  this.state == 'suggestion', 
    "You are not authorized. Unregistered users can only submit suggestions.", 401
)

var self = this

this.creationDate   = new Date().getTime()
this.creator        = me ? me.id : undefined

    
var icUtils = require('../ic-utils.js')

dpd.users.get().then(function(users){
    users.forEach(function(user){
    if(user.privileges.indexOf('be_notified_about_suggestions') != -1 && user.email)
        icUtils.mailSuggestion(user.email, self)    
    })
})