# Getting started

- Step 1. (Setup NPM) Clone this repository and run `npm install`.

The install deletes two important files -.- Get them back:

```console
$ git checkout dpd/node_modules/ic-meta.js
$ git checkout dpd/node_modules/ic-actions.js
```

- Step 2. (Setup database) Spin up the mongodb container to insert a user into it:

```
$ (sudo) docker-compose up
```

This should start the database locally. Connect to it:

```
$ mongo mongodb://localhost:27017
```

(you should check before starting this that you didn't have another local instance of mongodb running on your computer).

Then insert a user in your database (replace the <YOUR_USERNAME> and <YOUR_PASSWORD> fields before copy-pasting in your mongo shell):

```
> use deployd
switched to db deployd
> db.createUser({
	user: "patrickds",
	pwd: "test1234",
	roles: [{ role: "dbAdmin", db: "deployd"}],
})
Successfully added user: {
        "user" : "<YOUR_USERNAME>",
        "roles" : [
                {
                        "role" : "dbAdmin",
                        "db" : "deployd"
                }
        ]
}
> db.getUsers() // sanity check
[
        {
                "_id" : "deployd.<YOUR_USERNAME>",
                "userId" : UUID("f40420c5-1f7c-47f9-ba94-c1d54f12725f"),
                "user" : "<YOUR_USERNAME>",
                "db" : "deployd",
                "roles" : [
                        {
                                "role" : "dbAdmin",
                                "db" : "deployd"
                        }
                ],
                "mechanisms" : [
                        "SCRAM-SHA-1",
                        "SCRAM-SHA-256"
                ]
        }
]
```

Note that if you exited the database, and then connected to it again, you won't be using the "deployd" database anymore, so if you try `db.getUsers()` then, it'll show an empty list. You can try this instead of typing `use deployd` again in this case:

```
db.getUsers({filter: {db: "deployd"}})
>>> [
        {
                "_id" : "deployd.<YOUR_USERNAME>",
                "userId" : UUID("8d6a92f1-fe66-4523-b637-c0e6e49e6d15"),
                "user" : "<YOUR_USERNAME>",
                "db" : "deployd",
                "roles" : [
                        {
                                "role" : "dbAdmin",
                                "db" : "deployd"
                        }
                ],
                "mechanisms" : [
                        "SCRAM-SHA-1",
                        "SCRAM-SHA-256"
                ]
        }
	]
```

When you're done, exit the shell and proceed to step 3.

- Step 3. Setting up the configuration files

* Move/rename config/config_example.json to config/config.json

Enter your database credentials into config/config.json. They should look like this:
```
{
	...,
	"db": {
			"host":         "localhost",
			"port":         "27017",
			"name":         "deployd",
			"credentials": {
					"username": "<YOUR_USERNAME>",
					"password": "<YOUR_PASSWORD>"
			}
	},
	...,
}
```
Note that this file is ignored, so you won't see changes in your repository.

* Run the following script, which updates the items setup and the database scheme:

```
$ npm run setup -- config/default-item-config.js
```

- Step 4. (Launching backend servers) 

* Start the database container:

```
$ (sudo) docker-compose up -d
```

You can check that the database is working properly by trying to connect to it: 
```
$ mongo mongodb://<YOUR_USERNAME>:<YOUR_PASSWORD>@localhost:27017/deployd
```
To make sure you are properly connected, you can try running the DB command `db.getUsers()` and get the same output as earlier.

* Start the backend servers:
```
$ npm start
```
To test that it works, write the following command in your terminal:
```
$ curl localhost:2413
```
It should return the following HTML document:
```
<!DOCTYPE html>
<html>
<head>
</head>
<body>
        works
</body>
</html>
```

* To stop the servers:
```
$ npm run stop-production
$ npm run stop-public-api
```

* To stop the database:
```
$ sudo docker-compose down
```

- Step 5. (Enter dashboard)

In order to see the dashboard you need a key. To get the key, you need the deployd command line interface.

* Install the deployd CLI globally: 
```
$ npm install deployd-cli -g
```

* Generate a DPD key 

If you have created a key already, follow those instead to re-use the previously generated key:

```
$ cd dpd && dpd showkey && cd ..
```

If you haven't generated a key yet, running the above commands will generate the following console output:
```
No key file found. Run the following to create one:

dpd keygen

```
so follow these instructions instead:
```
$ cd dpd
$ mkdir .dpd	#skip if you have done this before
$ dpd keygen    #skip if you have done this before
$ dpd showkey
```

* Visualize the dashboard

Open `localhost:2413/dashboard` (with the servers running, see Step 4 if necessary) in your browser and enter the key in the output of dpd keygen in the field displayed in the browser. This should give you access to the dashboard.
