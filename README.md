# TODO -app backend

School project by Elias Puukari and Lauri Pääjärvi

Easiest way to test his app is by going to
https://tamk-4a00ez62-3001-group02.herokuapp.com/

Known bugs:

Transactions in database/crudpromises.js do not work like they should. The rollbacks
are not actually triggered, and there is not a rejected promise returned either.
What this means in practice is that there will be sent a statuscode of succesfull
operation sent to the frontend even when it should be a failure.

It shouldn't cause bugs other than that if frontend is used as it is,
since validation should catch the errors before they end up being handled
in those transactions but I'm aware that you can never trust a frontend, even your own,
since it can be easily manipulated in browser's developer mode.

####

If you want to install this app for yourself, locally or in a server of your own,
follow the rest of the instructions, but you will also need to clone and install
the repository todo-frontend (React) as well, and at least for now the instructions
are not as detailed in the front end section, so you should be familiar in using
npx-create-app commands or ready to spend some time learning them. Sorry.

# Instructions to use this application

## 1. Clone repository in your CLI typing the following:

git clone https://github.com/lpaajarvi/todo-backend.git

## 2. The app uses MySQL database. Give your database credentials in /database/conf.js

host: process.env.host, // Change this to your database host address
user: process.env.user, // Change this to your database username
password: process.env.password, // Change this to your database password
database: process.env.database, // Change this to your database name

## 3. Use SQL commands from the repository to create a fresh install of the database.

database/create-tables.sql

## 4. Optionally you can create predetermined dummy information to use with the app, by running sql commands from the repository

database/create-content.sql

## 5. Go to the app folder and install module Nodemon to run the app (npm install nodemon)

npm install nodemon

## 6. Start the application with nodemon

nodemon index.js

## 7. Now you can run the application from http://localhost:8080
