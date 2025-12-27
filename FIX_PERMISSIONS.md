# How to Fix Permission/Authorization Error

## Step-by-Step Authorization:

1. **In Google Apps Script, run the test function:**
   - Select `testFormSubmission` from the function dropdown
   - Click the ▶️ Run button
   - You'll see an authorization prompt

2. **Click "Review permissions"** when prompted

3. **Choose your Google account** (the one that owns the Google Sheet)

4. **You'll see a warning about "Google hasn't verified this app"**
   - This is normal for Apps Script projects
   - Click **"Advanced"** at the bottom

5. **Click "Go to [Your Project Name] (unsafe)"**
   - Don't worry - this is safe for your own scripts

6. **Click "Allow"** to grant permissions

7. **Run the test again:**
   - Select `testFormSubmission` from the dropdown
   - Click ▶️ Run
   - It should work now!

## If You Still See Permission Errors:

### Option 1: Re-authorize the Script

1. In Google Apps Script, go to **"Run"** menu
2. Select **"testFormSubmission"**
3. Click ▶️ Run
4. When prompted, click "Review permissions" again
5. Click "Advanced" > "Go to [Project Name] (unsafe)"
6. Click "Allow"

### Option 2: Check Sheet Permissions

Make sure your Google account has access to the Google Sheet:

1. Open your Google Sheet
2. Click the **"Share"** button (top right)
3. Make sure your Google account (the one running the script) is listed
4. Make sure it has **"Editor"** or **"Owner"** permission

### Option 3: Clear Authorization and Re-authorize

1. In Google Apps Script, go to **"Run"** menu
2. Select **"testFormSubmission"**
3. Click ▶️ Run
4. If you see an authorization dialog, follow the steps above
5. If you don't see a dialog, the script might already be authorized

## After Authorization:

Once authorized, you should be able to:
- ✅ Run `testFormSubmission` successfully
- ✅ See test rows added to your Google Sheet
- ✅ Submit forms from your HTML page

## Important:

**You also need to redeploy after authorizing:**
1. Go to **Deploy** > **Manage deployments**
2. Click the ✏️ Edit icon
3. Click **"New version"**
4. Click **"Deploy"**
5. You may need to authorize again (click "Review permissions" > "Advanced" > "Allow")

This ensures the web app has the same permissions.

