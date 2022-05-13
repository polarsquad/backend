# Getting started

Clone this repository and run ``npm install``.

The install deletes two important files -.- Get them back:

```console 
$ git checkout dpd/node_modules/ic-meta.js 
$ git checkout dpd/node_modules/ic-actions.js 
```


Create a folder for database files:

```mkdir dpd/data```

Install mongod, setup a db at dpd/data:

``` mongod --dbpath=dpd/data ```

Connect to the db server and add a new database and admin user: For example ```mongo``` (probably in a second terminal window);
_Replace --USERNAME and --PASSWORD._:

```
> use deployd
switched to db deployd
> db.createUser({
...   user: "--USERNAME",
...   pwd: "--PASSWORD",
...   roles: [
...     { role: "dbAdmin", db: "deployd" } 
...   ]
... })
Successfully added user: {
	"user" : "--USERNAME",
	"roles" : [
		{
			"role" : "dbOwner",
			"db" : "deployd"
		}
	]
} 
```

Cancel mongod process.

Move/rename config/config_example.json to config/config.json

Enter the db credentilas into config.json; choose a port to your liking and host: 127.0.0.1.

Next setup items / database scheme:

```console
$ npm run setup -- config/default-item-config.js
```

## Check if everything works:


Start the server: 

```
npm start
```

Open ```127.0.0.1:2413``` in your browser (or use whatever port you changed the config to).

It should simply say 'works'.


stop the server:

```
npm stop
```

---


Alternatively (to see output like errors logs):

``` console
$ npm run prestart
$ node dpd/production.js
```

## Enter dashboard

In order to see the dashboard you need a key. To get the key, you need the deployd command line interface.
Install it globally like this: `` npm install deployd-cli -g ``

If you haven't generated a key yet, got to the dpd sub folder and run ```dpd keygen```; you should only do this once, otherwise the key will be overwritten.

```console
$ cd dpd
$ dpd keygen    #skip if you have done this before
$ dpd showkey
```

Open ```127.0.0.1:2413/dashboard``` in your browser (adjust port if you changed config.json)

Enter the key from above :)