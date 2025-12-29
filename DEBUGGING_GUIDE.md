# Debugging Guide - Form Not Saving Data

If nothing is being saved (neither to Google Sheets nor images to Drive), follow these steps:

## Step 1: Check Browser Console

1. Open your form in the browser
2. Press **F12** to open Developer Tools
3. Go to the **Console** tab
4. Submit the form
5. Look for:
   - Any error messages (red text)
   - "Form Submission Debug" logs
   - "Request sent successfully" message
   - File size information

## Step 2: Check Google Apps Script Logs

1. Go to https://script.google.com
2. Open your Google Apps Script project
3. Click **View** > **Logs** (or **Executions**)
4. Submit the form again
5. Look for:
   - "=== doPost called ==="
   - "=== submitForm called ==="
   - "Parameters:" list
   - "Has fileData: true/false"
   - Any error messages

## Step 3: Verify Google Apps Script Deployment

1. In Google Apps Script, click **Deploy** > **Manage deployments**
2. Check that:
   - **Execute as:** Me
   - **Who has access:** Anyone (including anonymous)
3. If you made changes to the script, click **Edit** and **Deploy** again

## Step 4: Test the Connection

1. Open your form
2. Open browser console (F12)
3. Run this test command:
```javascript
fetch('YOUR_GOOGLE_SCRIPT_URL', {
  method: 'POST',
  mode: 'no-cors',
  headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
  body: 'action=submit&name=Test&email=test@test.com&phone=123&message=Test message'
})
```

## Step 5: Check Google Sheet

1. Open your Google Sheet
2. Check if:
   - New rows are being added
   - Data appears in the correct columns
   - Timestamp is being saved

## Step 6: Check Google Drive

1. Go to Google Drive
2. Look for a folder named "Birthday" (or your DRIVE_FOLDER_NAME)
3. Check if uploaded files appear there

## Common Issues

### Issue: No logs in Google Apps Script
**Solution:** The request isn't reaching the server. Check:
- Google Script URL is correct
- Web app is deployed with "Anyone" access
- No network/firewall blocking the request

### Issue: "No action parameter" error
**Solution:** The form data isn't being sent correctly. Check:
- Browser console for request body
- Form data is being constructed properly

### Issue: "Has fileData: false"
**Solution:** File data isn't being received. Check:
- File size isn't too large
- File is being read correctly (check browser console)
- Base64 encoding is working

### Issue: Data appears in Sheet but no file in Drive
**Solution:** File upload is failing. Check:
- Google Apps Script logs for file upload errors
- Drive folder permissions
- File size limits

## Quick Test

Run this in Google Apps Script to test if everything works:

1. Click the **play button** next to `testFormSubmission` function
2. Check the logs for any errors
3. Check your Google Sheet - you should see a test row

## Still Not Working?

1. **Check the exact error message** in Google Apps Script logs
2. **Verify the SPREADSHEET_ID** is correct
3. **Try submitting without a file** first to isolate the issue
4. **Check if the form fields match** between HTML and Google Apps Script

