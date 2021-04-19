# Adding Credentials
In order to access the Google Drive API to read spreadsheets, log into your Google account and go to the [Google Developer Console](https://console.cloud.google.com/home). </br>
From there, [create a new project](https://console.cloud.google.com/projectcreate) with whatever name you want.</br> 
Then, enable the [Google Drive API](https://console.cloud.google.com/apis/library/drive.googleapis.com) for the project you just created.</br>
Open up the dashboard for the project and go to the `Service Accounts` section on the sidebar.</br>
Create a new service account. The name and description do not matter, most of the text boxes can be left blank.</br>
Once it is created, it will appear at the end of the list on the `Service Accounts` page.</br>
There, open up the `Actions` menu for it and `Manage Keys`.</br>
Press `Add a key > Create new key > JSON`. This will automatically start a download of a JSON file. These are the credentials for the service account.</br>
If you lose the key, you can go back to the same page to generate a new one the same way.</br>
See below for the two ways to add the credentials to the repository: The original JSON file or Environment variables

# Adding Credentials - JSON File Method
To add the credentials to the repository using the original JSON file, simply go to the root/main folder of the repository and create a folder named `private/`.</br>
Move the downloaded credentials file into this folder and rename it to `credentials.json`.</br>
All done!

# Adding Credentials - Environment Variable Method
This method is recommended if you intend to keep the credentials private but need to send the files to another location like GitHub or Heroku.</br>
First, set the environment variable `process.env.VARIABLE_MODE` to `TRUE`.</br>
Go to the page where you can set the `Environment Variables` in the selected service and open up the downloaded credentials JSON file from earlier.</br>
The name of each remaining environmental variable to add will be the keys from the JSON file like `type`, `private_key`, `auth_provider_x509_cert_url`, and more.</br>
Add the value of those keys to their respective variables to complete the credential set-up process.

# Running the project
Before running the project for the first time, run the command `npm install` to install the necessary dependencies.</br>
The first step can be skipped every time after that. To run the project, simply run `node .` or `node app.js`.
`Note: The service account email must have permission to read and write to the spreadsheets being used when running the project later.`</br>