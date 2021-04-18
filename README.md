# Reading and Writing to a Google Sheet through Node.js
To run locally, rename a Google Drive API Service Account credential file from the Google Developer Console into `SpreadSheetCredentials.json` move it into a folder named `private/` at the root of the repository.<br/>
Note: The service account email must have permission to read and write to the spreadsheet being used.

# Running on Heroku
To run the project on Heroku, go to `spreadsheet.js` and comment out line 5 before uncommenting lines 6-17.
Then deploy the project to your Heroku account and convert all the fields in the credentials file as environment variables on Heroku's project settings.