cancelUnless(this.state == 'public' || (me && me.privileges.indexOf('edit_items') != -1) )

cancelIf(this.proposalFor)

var self = this

if(this.lastEditor){
    dpd.users.get(this.lastEditor)
    .then(function(lastEditor){
        self.lastEditor = lastEditor.displayName
    })
}

if(this.creator){
    dpd.users.get(this.creator)
    .then(function(creator){
        self.creator = creator.displayName
    })
}
