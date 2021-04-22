cancelUnless(
        internal
    ||  this.state == 'public' 
    || (me && me.privileges && me.privileges.indexOf('edit_items') != -1) 
)

cancelIf(this.proposalFor)

var self = this

if(me && me.privileges.indexOf('edit_items') != -1 ){

    if(this.lastEditor){
        $addCallback()
        dpd.users.get(this.lastEditor)
        .then(
            function(lastEditor){
                self.lastEditor = lastEditor.displayName
                $finishCallback()
            },
            function(){
                 $finishCallback()
            }
        )
    }
    
    if(this.creator){
        $addCallback()
        dpd.users.get(this.creator)
        .then(
            function(creator){
                self.creator = creator.displayName
                $finishCallback()
            },function(){
                $finishCallback()   
            }
        )
    }

    this.proposals = this.proposals || []

    $addCallback()
    dpd.items.get({proposalFor: this._id})
    .then(
        proposals => { 
            console.log(proposals)
            this.proposals.push(...proposals)
            $finishCallback()
        },

        $finishCallback()
    )

} else {
    this.note           = undefined
    this.lastEditor     = undefined
    this.lastEditDate   = undefined
    this.creator        = undefined
    this.creationDate   = undefined
}
