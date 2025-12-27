# Custom Form Setup Instructions

This guide will help you set up the custom form to store data directly in Google Sheets (which is stored in Google Drive).

## Prerequisites

- A Google account
- Access to Google Sheets and Google Apps Script

## Step 1: Create a Google Sheet

1. Go to [Google Sheets](https://sheets.google.com)
2. Create a new spreadsheet
3. Set up column headers in Row 1 (adjust based on your form fields):
   - Column A: `Timestamp`
   - Column B: `Name`
   - Column C: `Email`
   - Column D: `Phone`
   - Column E: `Message`
   - Column F: `File Name`
   - Column G: `File Link`
4. Copy the Spreadsheet ID from the URL:
   - The URL looks like: `https://docs.google.com/spreadsheets/d/SPREADSHEET_ID_HERE/edit`
   - Copy the `SPREADSHEET_ID_HERE` part

## Step 2: Set Up Google Apps Script

1. Go to [Google Apps Script](https://script.google.com)
2. Click **"New Project"**
3. Delete the default `myFunction` code
4. Paste the code from `google-apps-script-code.gs`
5. Replace `YOUR_SPREADSHEET_ID_HERE` with your actual Spreadsheet ID
6. Click the **Save** icon (💾) and name your project (e.g., "Form Handler")

## Step 3: Deploy as Web App

1. Click **"Deploy"** > **"New deployment"**
2. Click the **⚙️** (gear icon) next to "Select type"
3. Choose **"Web app"**
4. Set the following:
   - **Description**: "Form Submission Handler" (optional)
   - **Execute as**: `Me`
   - **Who has access**: `Anyone` (this allows your form to submit data)
5. Click **"Deploy"**
6. **IMPORTANT**: Authorize the script when prompted:
   - Click "Authorize access"
   - Choose your Google account
   - Click "Advanced" > "Go to [Project Name] (unsafe)"
   - Click "Allow"
7. Copy the **Web App URL** that appears (looks like: `https://script.google.com/macros/s/...`)

## Step 3.5: Redeploying After Making Changes

If you make changes to your Google Apps Script code (`.gs` file), you need to redeploy for the changes to take effect:

### Option 1: Update Existing Deployment (Recommended - Keeps Same URL)

1. Click **"Deploy"** > **"Manage deployments"**
2. Find your existing deployment in the list
3. Click the **✏️** (pencil/edit icon) next to the deployment
4. Click **"New version"** to create a new version with your changes
5. Click **"Deploy"**
6. **Note**: The URL stays the same, so you don't need to update `custom-form.html`

### Option 2: Create New Deployment (Gives New URL)

1. Click **"Deploy"** > **"New deployment"**
2. Follow the same steps as initial deployment
3. **Important**: You'll get a new URL - remember to update `GOOGLE_SCRIPT_URL` in `custom-form.html` with the new URL

### Important Notes:
- **Version updates**: When you update an existing deployment, Google Apps Script creates a new version. The old version will still work until users' sessions expire (or you can manually disable old versions).
- **Testing**: Always test your changes after redeploying to ensure everything works correctly.
- **Authorization**: If you add new Google services/APIs to your script, you may need to re-authorize permissions.

## Step 4: Update the Form HTML

1. Open `custom-form.html`
2. Find this line near the bottom:
   ```javascript
   const GOOGLE_SCRIPT_URL = 'YOUR_GOOGLE_APPS_SCRIPT_WEB_APP_URL_HERE';
   ```
3. Replace `YOUR_GOOGLE_APPS_SCRIPT_WEB_APP_URL_HERE` with your Web App URL from Step 3
4. Save the file

## Step 5: Customize Form Fields (Optional)

If you need to add or modify form fields:

### In `custom-form.html`:
1. Add new input fields in the form section
2. Make sure each input has a `name` attribute (e.g., `name="fieldname"`)

### In `google-apps-script-code.gs`:
1. Update the `rowData` array to include your new fields
2. Update the column headers in your Google Sheet to match
3. Adjust the order to match your sheet columns
4. If you want to change where files are stored, modify the `DRIVE_FOLDER_NAME` constant

### Example - Adding a new field:

**In HTML:**
```html
<div>
    <label for="subject" class="block text-sm font-medium text-gray-700 mb-2">
        Subject
    </label>
    <input 
        type="text" 
        id="subject" 
        name="subject" 
        placeholder="Enter subject"
        class="w-full px-4 py-3 border border-gray-300 rounded-lg...">
</div>
```

**In Google Apps Script:**
```javascript
const rowData = [
  data.timestamp || new Date(),
  data.name || '',
  data.email || '',
  data.phone || '',
  data.subject || '',  // New field
  data.message || ''
];
```

**In Google Sheet:**
Add "Subject" as a column header in Row 1

## Step 6: Test the Form

1. Open `custom-form.html` in your browser
2. Fill out the form
3. Submit it
4. Check your Google Sheet - you should see a new row with the submitted data

## Troubleshooting

### Form submits but no data appears in Sheet
- Check that the Spreadsheet ID is correct in the Apps Script code
- Verify the sheet has the correct column headers
- Check the Apps Script execution log: View > Logs

### "Please configure the Google Apps Script URL" error
- Make sure you've replaced the placeholder URL in `custom-form.html`
- Verify the URL is correct and the web app is deployed

### CORS errors
- The code uses `mode: 'no-cors'` which is normal - you won't see the response, but data will still be saved
- Check the Google Sheet to confirm data is being saved

### Authorization errors
- Make sure you've authorized the Apps Script properly
- Try redeploying the web app

## File Upload Features

The form supports uploading images and videos:
- **Accepted formats**: Images (JPG, PNG, GIF, etc.) and Videos (MP4, MOV, AVI, etc.)
- **Maximum file size**: 25MB (client-side validation)
- **Storage location**: Files are saved to Google Drive in a folder named "Form Uploads" (you can change this in the script)
- **File access**: Uploaded files are shared as "Anyone with the link can view"
- **Sheet tracking**: The file name and Google Drive link are stored in the spreadsheet

### Customizing File Storage Location

In `google-apps-script-code.gs`, you can change the folder name:
```javascript
const DRIVE_FOLDER_NAME = 'Form Uploads';  // Change this to your preferred folder name
```

Set it to an empty string `''` to store files in the root of your Google Drive.

## Security Notes

- The form is set to allow "Anyone" to submit data (which is necessary for public forms)
- Consider adding validation in the Apps Script if needed
- You can add spam protection or rate limiting if required
- Uploaded files are publicly accessible via the link stored in the sheet

## Need Help?

If you need to match the exact fields from your original Google Form, please provide:
- The list of all field names/types from the original form
- Any special requirements (file uploads, dropdowns, etc.)

