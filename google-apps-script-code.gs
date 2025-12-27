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

/**
 * Handle POST request from the form
 */
function doPost(e) {
  // Start logging immediately
  console.log('=== doPost called ===');
  console.log('Event exists:', !!e);
  console.log('SPREADSHEET_ID:', SPREADSHEET_ID);
  
  try {
    // Check if event parameter exists
    if (!e) {
      console.error('ERROR: Event parameter is missing');
      throw new Error('Event parameter is missing. This function should be called as a web app.');
    }
    
    // Check if SPREADSHEET_ID is configured
    if (SPREADSHEET_ID === 'YOUR_SPREADSHEET_ID_HERE' || !SPREADSHEET_ID || SPREADSHEET_ID.trim() === '') {
      console.error('ERROR: SPREADSHEET_ID is not configured');
      throw new Error('SPREADSHEET_ID is not configured. Please update it in the script.');
    }
    
    // Get form data - prioritize URL parameters (form-urlencoded) as it's more reliable
    let data;
    const params = e.parameter || {};
    
    // Check if we have URL parameters (form-urlencoded submission)
    if (params.name || params.email || params.message) {
      // Data came as URL parameters (form-urlencoded)
      data = {
        timestamp: params.timestamp || new Date(),
        name: params.name || '',
        email: params.email || '',
        phone: params.phone || '',
        message: params.message || '',
        fileName: params.fileName || '',
        fileType: params.fileType || '',
        fileData: params.fileData || ''
      };
    } else if (e.postData && e.postData.type === 'application/json') {
      // Handle JSON data from fetch API
      try {
        data = JSON.parse(e.postData.contents);
      } catch (parseError) {
        console.error('Error parsing JSON:', parseError);
        throw new Error('Invalid JSON data received');
      }
    } else {
      // No data received
      throw new Error('No form data received');
    }
    
    // Log for debugging (check View > Logs in Apps Script)
    console.log('=== Data Processing ===');
    console.log('Event received. postData exists:', !!e.postData);
    console.log('Event postData type:', e.postData ? e.postData.type : 'N/A');
    console.log('Event parameters:', Object.keys(e.parameter || {}));
    console.log('All parameters:', e.parameter);
    console.log('Received data object:', {
      timestamp: data.timestamp,
      name: data.name,
      email: data.email,
      phone: data.phone,
      message: data.message,
      hasFile: !!(data.fileData && data.fileName),
      fileName: data.fileName
    });
    
    // Validate we have at least name or email
    if (!data.name && !data.email) {
      throw new Error('No name or email provided in form data');
    }
    
    // Handle file upload if present
    let fileUrl = '';
    let fileName = '';
    
    if (data.fileData && data.fileName) {
      try {
        console.log('Processing file upload:', data.fileName);
        // Get or create the folder for uploads
        let folder = getOrCreateFolder(DRIVE_FOLDER_NAME);
        
        // Decode base64 file data
        const fileBlob = Utilities.newBlob(
          Utilities.base64Decode(data.fileData),
          data.fileType || 'application/octet-stream',
          data.fileName
        );
        
        // Create file in Google Drive
        const file = folder.createFile(fileBlob);
        
        // Set file permissions to make it accessible
        file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
        
        // Get file URL
        fileUrl = file.getUrl();
        fileName = data.fileName;
        console.log('File uploaded successfully:', fileUrl);
        
      } catch (fileError) {
        console.error('Error uploading file:', fileError.toString());
        // Continue with form submission even if file upload fails
        fileName = data.fileName + ' (upload failed: ' + fileError.toString() + ')';
      }
    }
    
    // Open the spreadsheet
    console.log('=== Opening Spreadsheet ===');
    console.log('Attempting to open spreadsheet with ID:', SPREADSHEET_ID);
    
    let sheet;
    try {
      const spreadsheet = SpreadsheetApp.openById(SPREADSHEET_ID);
      sheet = spreadsheet.getActiveSheet();
      console.log('Spreadsheet opened successfully. Sheet name:', sheet.getName());
    } catch (sheetError) {
      console.error('ERROR opening spreadsheet:', sheetError.toString());
      throw new Error('Failed to open spreadsheet. Check that SPREADSHEET_ID is correct and the sheet is accessible. Error: ' + sheetError.toString());
    }
    
    // Prepare row data (adjust column order to match your sheet headers)
    const rowData = [
      data.timestamp || new Date(),
      data.name || '',
      data.email || '',
      data.phone || '',
      data.message || '',
      fileName || '',
      fileUrl || ''
    ];
    
    console.log('=== Adding Row to Sheet ===');
    console.log('Row data to append:', rowData);
    console.log('Current last row before append:', sheet.getLastRow());
    
    // Append the row to the sheet
    try {
      sheet.appendRow(rowData);
      const newLastRow = sheet.getLastRow();
      console.log('✅ Row added successfully! New last row:', newLastRow);
      console.log('Verifying data in row:', sheet.getRange(newLastRow, 1, 1, 7).getValues());
    } catch (appendError) {
      console.error('ERROR appending row:', appendError.toString());
      throw new Error('Failed to append row to sheet. Error: ' + appendError.toString());
    }
    
    // Return success response with CORS headers
    return ContentService
      .createTextOutput(JSON.stringify({
        'status': 'success',
        'message': 'Data stored successfully',
        'fileUrl': fileUrl
      }))
      .setMimeType(ContentService.MimeType.JSON);
      
  } catch (error) {
    console.error('=== ERROR IN doPost ===');
    console.error('Error type:', typeof error);
    console.error('Error message:', error.toString());
    console.error('Error stack:', error.stack);
    
    // Return error response
    return ContentService
      .createTextOutput(JSON.stringify({
        'status': 'error',
        'message': error.toString(),
        'errorType': typeof error
      }))
      .setMimeType(ContentService.MimeType.JSON);
  }
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
