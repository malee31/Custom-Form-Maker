# Reading and Writing to a Google Sheet through Node.js
To run locally, you'll need a file named SpreadSheetCredentials.json (Rename a Google Drive API service account key JSON file from Google Developers Console) placed in a folder named private at the root of this repository..<br/>
Then go to spreadsheet.js and uncomment line 5 and comment out lines 6 to 17.

The email for the service account must be able to read and write to the spreadsheet id being used as well.

To run on HeroKu, set the appropriate environment variables instead of using the credentials JSON file and deploy it.
