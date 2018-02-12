cancelUnless( 
        internal
    ||  (me && me.privileges && me.privileges.indexOf('edit_items') != -1) 
    ||  this.state == 'suggestion', 
    "You are not authorized. Unregistered users can only submit suggestions.", 401
)

var icUtils = require(process.cwd()+'/../ic-utils.js'),
    self = this

this.creationDate   = new Date().getTime()
this.creator        = me ? me.id : undefined


if(this.state == 'suggestion') {
    var next =  this.proposalFor
                ?   dpd.items.get({id:this.proposalFor})
                :   Promise.resolve()
    
        
    next.then(function(target){
        dpd.users.get().then(function(users){
            users.forEach(function(user){
                if(user.privileges.indexOf('be_notified_about_suggestions') != -1 && user.email){
                    try         { icUtils.mailSuggestion(user.email, self, target)   }
                    catch(e)    { console.error(e)}
                }
            })
        })    
    }, console.log)
}