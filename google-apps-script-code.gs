/**
 * Google Apps Script Code to Store Form Data in Google Sheets and Files to Google Drive
 * 
 * SETUP INSTRUCTIONS:
 * 
 * 1. Go to https://script.google.com
 * 2. Click "New Project"
 * 3. Replace the default code with this code
 * 4. Update the SPREADSHEET_ID variable with your Google Sheet ID
 *    (You can get this from the URL of your Google Sheet)
 * 5. Create a Google Sheet and set up column headers:
 *    Row 1: Timestamp | Name | Email | Phone | Message | File Name | File Link
 *    (Adjust column names based on your form fields)
 * 6. Click "Deploy" > "New deployment"
 * 7. Select type: "Web app"
 * 8. Set "Execute as": Me
 * 9. Set "Who has access": Anyone
 * 10. Click "Deploy"
 * 11. Copy the Web App URL and paste it in custom-form.html
 *     Replace 'YOUR_GOOGLE_APPS_SCRIPT_WEB_APP_URL_HERE' with the URL
 * 
 * NOTE: The form fields in this script should match the field names
 * in your custom-form.html file
 */

// Replace with your Google Sheet ID (found in the Sheet URL)
const SPREADSHEET_ID = '1bhJZNV_WipJ7J4dk5nDus-y7hxk-cCAE0DO7UtXDMBo';

// Optional: Set a folder name in Google Drive where uploaded files will be stored
// If not set, files will be stored in the root of your Drive
const DRIVE_FOLDER_NAME = 'Birthday';

/************ ROUTER ************/
function doPost(e) {
  try {
    const action = e.parameter.action;

    if (action === 'upload') return uploadFile(e);
    if (action === 'submit') return submitForm(e);
    if (action === 'delete') return deleteFile(e);

    return json({ success: false, error: 'Invalid action' });
  } catch (err) {
    return json({ success: false, error: err.message });
  }
}

/************ UPLOAD FILE ************/
function uploadFile(e) {
  if (!e.parameter.file) throw new Error('No file received');

  const folder = getOrCreateFolder(DRIVE_FOLDER_NAME);

  const blob = Utilities.newBlob(
    Utilities.base64Decode(e.parameter.file),
    e.parameter.mimeType,
    e.parameter.fileName
  );

  const file = folder.createFile(blob);
  file.setSharing(
    DriveApp.Access.ANYONE_WITH_LINK,
    DriveApp.Permission.VIEW
  );

  return json({
    success: true,
    fileId: file.getId(),
    fileName: file.getName(),
    fileUrl: file.getUrl()
  });
}

/************ DELETE FILE ************/
function deleteFile(e) {
  const fileId = e.parameter.fileId;
  if (!fileId) throw new Error('No fileId');

  DriveApp.getFileById(fileId).setTrashed(true);
  return json({ success: true });
}

/************ SUBMIT FORM ************/
function submitForm(e) {
  const sheet = SpreadsheetApp
    .openById(SPREADSHEET_ID)
    .getActiveSheet();

  // Handle both form-urlencoded and JSON data
  let data;
  if (e.postData && e.postData.type === 'application/json') {
    data = JSON.parse(e.postData.contents);
  } else {
    // Form-urlencoded data (from URL parameters)
    data = {
      timestamp: e.parameter.timestamp || new Date(),
      name: e.parameter.name || '',
      email: e.parameter.email || '',
      phone: e.parameter.phone || '',
      message: e.parameter.message || '',
      fileName: e.parameter.fileName || '',
      fileUrl: e.parameter.fileUrl || ''
    };
  }

  sheet.appendRow([
    new Date(),
    data.name || '',
    data.email || '',
    data.phone || '',
    data.message || '',
    data.fileName || '',
    data.fileUrl || ''
  ]);

  return json({ success: true });
}

/************ HELPER ************/
function json(obj) {
  return ContentService
    .createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}

/**
 * Get or create a folder in Google Drive
 */
function getOrCreateFolder(folderName) {
  if (!folderName || folderName.trim() === '') {
    return DriveApp.getRootFolder();
  }
  
  // Try to find existing folder
  const folders = DriveApp.getFoldersByName(folderName);
  if (folders.hasNext()) {
    return folders.next();
  }
  
  // Create new folder if it doesn't exist
  return DriveApp.createFolder(folderName);
}

/**
 * Handle GET request (for testing)
 */
function doGet(e) {
  return ContentService
    .createTextOutput('Form submission endpoint is ready. Use POST method to submit data.')
    .setMimeType(ContentService.MimeType.TEXT);
}

/**
 * TEST FUNCTION - Run this manually to test if everything works
 * Click the play button next to this function name to run it
 */
function testFormSubmission() {
  console.log('=== Starting Test ===');
  console.log('SPREADSHEET_ID:', SPREADSHEET_ID);
  console.log('DRIVE_FOLDER_NAME:', DRIVE_FOLDER_NAME);
  
  try {
    // Check if SPREADSHEET_ID is configured
    if (SPREADSHEET_ID === 'YOUR_SPREADSHEET_ID_HERE' || !SPREADSHEET_ID || SPREADSHEET_ID.trim() === '') {
      throw new Error('SPREADSHEET_ID is not configured');
    }
    
    // Test opening the spreadsheet
    console.log('Attempting to open spreadsheet...');
    const spreadsheet = SpreadsheetApp.openById(SPREADSHEET_ID);
    const sheet = spreadsheet.getActiveSheet();
    console.log('✅ Spreadsheet opened successfully!');
    console.log('Sheet name:', sheet.getName());
    console.log('Current last row:', sheet.getLastRow());
    
    // Test adding a row
    console.log('Attempting to add test row...');
    const testData = [
      new Date(),
      'Test Name',
      'test@example.com',
      '1234567890',
      'This is a test submission',
      '',
      ''
    ];
    
    sheet.appendRow(testData);
    const newLastRow = sheet.getLastRow();
    console.log('✅ Test row added successfully!');
    console.log('New last row:', newLastRow);
    console.log('Data in new row:', sheet.getRange(newLastRow, 1, 1, 7).getValues());
    
    // Test Drive folder
    console.log('Testing Drive folder...');
    const folder = getOrCreateFolder(DRIVE_FOLDER_NAME);
    console.log('✅ Drive folder accessible:', folder.getName());
    
    console.log('=== TEST PASSED ===');
    return 'SUCCESS: All tests passed! Check your Google Sheet - you should see a test row.';
    
  } catch (error) {
    console.error('=== TEST FAILED ===');
    console.error('Error:', error.toString());
    console.error('Error stack:', error.stack);
    return 'ERROR: ' + error.toString();
  }
}
