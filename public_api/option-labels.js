

export class OptionLabels {


	constructor(
		db
	){
		this.db 	= db
		this.ready	= this.update()
	}

	get collection(){
		return this.db.collection('options')
	}

	async update(){
		const items = await this.collection.find({}).toArray()

		this.cache = new Map()

		items.forEach( item => this.cache.set(item.tag, item.label) )
	}

	getLabel(key){
		return this.cache.get(key)
	}

}