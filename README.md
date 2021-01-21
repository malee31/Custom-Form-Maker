# Reading and Writing to a Google Sheet through Node.js

To run locally, place a file named `SpreadSheetCredentials.json` (Rename a Google Drive API service account key JSON
file from Google Developers Console) into a folder named `private/` at the root of this repository.<br/>
Then go to `spreadsheet.js`, uncomment line 5, and comment out lines 6 to 17.

The email for the service account must be able to read and write to the Spreadsheet ID being used.

To run on HeroKu, set the appropriate environment variables instead of using the credentials JSON file and deploy it.