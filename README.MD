# Getting started

## Step 1. (Setup NPM)

- Clone this repository and run `npm install`.

## Step 2. (Setup database)

- Install and connect locally to your MongoDB instance

- Create default user and database

## Step 3. Setting up the configuration files

- Make a copy of ".env.template" and rename it ".env" so that you can inject environment variables into the backend services.

Enter your database credentials in the .env file under DB_USERNAME and DB_PASSWORD:

```
DB_USERNAME=<YOUR_USERNAME>
DB_PASSWORD=<YOUR_PASSWORD>
```

### Important: Never commit in this .env file: Credentials or sensitive data related to production environment. Platform adminstrators should handle this part securily for you!!!

- Run the following script, which updates the items setup and the database scheme:

```
$ npm run setup -- config/default-item-config.js
```

## Step 4. (Launching backend servers in development)

- Make sure your MongoDB instance is running and configured like in previous steps

- Start the backend servers:

```
$ npm run start-production
$ npm run start-public-api
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

(or look at in in your browser and see a blank page with the word "works" in it).

- To stop the servers:

```
$ npm run stop-production
$ npm run stop-public-api
```

## Step 5. (Enter dashboard)

In order to see the dashboard you need a key. To get the key, you need the deployd command line interface.

- Install the deployd CLI globally (if not already present): 

```
$ npm install deployd-cli -g
```

- Generate a DPD key 

If you have created a key already, use this command to re-use the previously generated key:

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
$ cd ..
```

- Visualize the dashboard

Open `localhost:2413/dashboard` (with the servers running, see Step 4 if necessary) in your browser and enter the key in the output of dpd keygen in the field displayed in the browser. This should give you access to the dashboard.

# Docker Setup

## Prerequisites
* [docker](https://docs.docker.com/get-docker/)
* [docker-compose](https://docs.docker.com/compose/install/)


## User guide

### Step-1 Review the .env file and adjust your parameters

```shell
# Generic
PRODUCTION_API_PORT=2413
PUBLIC_API_PORT=3003

# Mail delivery system
MAIL_IS_SECURE=true


# Database connection default docker-compose local dev environment
DB_HOST=mongo
DB_PORT=27017
DB_NAME=deployd
DB_USERNAME=deployd
DB_PASSWORD=secret

# Voice reader
VOICE_READER_BASE_URL="--voiceReader-baseUrl"
VOICE_READER_CUSTOMER_ID="--voiceReader-customerId"

# Suggestions
SUGGESTIONS_REQUIRE_MAIL=true
SUGGESTIONS_REQUIRE_API_KEY="new"
SUGGESTIONS_REQUIRE_NAME=true
SUGGESTIONS_SEND_CONFIRMATION=true
```

PS: The default values are mostly compatible with local dev environment.

For more details please contact the dev teams regarding these env-vars.


### Step-2 Build locally and test the backend with docker-compose

```shell
# --build option is to skip cache usage
# you can append -d daemon mode to run the containers in the background
docker-compose up --build
```

PS: By default the backend is accessible from localhost.

Feel free to adjust docker-compose and .env files or create new ones in case you would like
to use different ports and run multiple backend instances at the same environment.

### Clean up
```shell
# The down cmd stops containers and removes containers,
# networks, volumes, and images created by up
docker-compose down
```

# CI/CD Pipelines
At the moment we are using community github-actions for building and pushing
docker images to docker-hub repository [infocompass](https://hub.docker.com/u/infocompassde)

## Prerequisites
These secrets must be configured at the organization level or the repository itself:

| Themes      | Value |
| ----------- | ----------- |
|DOCKERHUB_USERNAME | infocompass |
|DOCKERHUB_TOKEN | #To get from dockerhub account admin |

## User guide

* By default the pipeline will build and ship the default theme docker image (automatically triggered once merged to the master branch)

* The docker images tagging will be done using the git revision number.