cancelUnless( 
        (me && me.privileges.indexOf('edit_items') != -1) 
    ||  this.state == 'suggestion', 
    "You are not authorized. Unregistered users can only submit suggestions.", 401
)

var self = this

this.creationDate   = new Date().getTime()
this.creator        = me.id

// partial suggestions:
if(this.proposalFor){
    
    var icUtils = require('../ic-utils.js')
    
    dpd.users.get().then(function(users){
        users.forEach(function(user){
        if(user.privileges.indexOf('be_notified_about_suggestions') != -1 && user.email)
            icUtils.mail(user.email, 'new suggestion', JSON.stringify(self))    
        })
    })
    
}