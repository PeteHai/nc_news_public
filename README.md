# nc_news_public

## Summary
This is a backend project that builds a reddit inspired news-forum api for the purpose of accessing application data programmatically.
The database is PSQL (built using version 12.9) and it is interacted with using node-postgress.

## Api hosted on heroku:
All endpoints can be viewed at https://pete-nc-news-project.herokuapp.com/api/

## Setup instructions 
### clone this repo to your local device
Run the below command in the terminal to clone this repo:
"git clone https://github.com/PeteHai/nc_news_public.git "

### Install dependencies
The dependencies (including dev dependencies) can be installed by running the following command in your terminal:
"npm install"
*Note that you must be in the cloned repo for the install to fully function

The dependencies that are to be install are:
- jest
- jest-sorted
- pg-format
- cors
- dotenv
- express
- pg
- supertest

### dotenv files
Two dotenv files aneed to be created - these will contain your psql password and therefore are included in the gitignore files for sensitivity.

first file:
filename: .env.development
code: 
"PGDATABASE=nc_news
PGPASSWORD= < type your psql password here>"

second file:
filename: .env.test
code: 
"PGDATABASE=nc_news_test
PGPASSWORD= < type your psql password here>"

### Seed the databases
The following command will seed he databases - ensure this is done during the initial setup so that the databases are created.
"npm run seed"

### run the tests
The tests are run using jest.  "npm test app.test.js" will run the full suite of tests.  You can target specific tests by typing ".only" directly into the code, after "describe" or "test".










