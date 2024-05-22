## Store the MongoDB data's location to "<whoami>/mongodb"
``mongod --dbpath ~/mongodb``

## Install node modules
``npm install``

## Initialize the MongoDB database
``node loadDatabase.js``

## Start the Node.js web server and build the Project
``npx nodemon webServer.js & npm run build:w``
