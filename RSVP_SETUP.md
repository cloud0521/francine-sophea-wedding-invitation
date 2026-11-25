# Google Sheets RSVP setup

The RSVP card supports 1–5 invited guests. Each guest is written to a separate
row in the private response sheet, with one shared timestamp and submission ID
for the group.

The linked spreadsheet was inspected before implementation. Its `responces`
tab (sheet ID `0`) is currently empty and has no header row. The Apps Script
below initializes the four requested headers on the first valid submission. If
the tab has been changed before setup, the script checks the row 1 headers and
stops without changing existing data unless all required columns are present.

## 1. Create the Apps Script

1. Open the [wedding response spreadsheet](https://docs.google.com/spreadsheets/d/15QxAqlSeZLoBa06Tcbi-7lV7wK3kdGkOAkyU60tayCg/edit?gid=0#gid=0).
2. Select **Extensions → Apps Script**.
3. Replace the editor contents in `Code.gs` with the code in
   [google-apps-script/Code.gs](google-apps-script/Code.gs), then save.
4. In Apps Script, open **Project Settings → Script properties → Add script
   property**. Add:

   - Property: `RSVP_PROXY_SECRET`
   - Value: the random secret you will create in step 2

   Do not put this value in `src`, a `VITE_` variable, or the spreadsheet.

## 2. Create one private proxy secret

From the project folder, generate a long random value with Node:

```powershell
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

Copy the generated value into the Apps Script property above. Keep it private;
you will enter the same value into local and Vercel server environment settings.

## 3. Authorize the spreadsheet access

In the Apps Script editor, choose `authorizeSpreadsheetAccess` from the function
selector and click **Run**. Review and allow the Google Sheets access prompt.
This reads the spreadsheet and checks for the target tab; it does not write any
guest information or modify existing rows.

## 4. Deploy the script as a web app

1. Select **Deploy → New deployment**.
2. Select the gear icon and choose **Web app**.
3. Set **Execute as** to your Google account.
4. Set **Who has access** to **Anyone** so guests do not need a Google account.
   The Apps Script endpoint still requires the server-only HMAC signature from
   the website proxy before it will process a submission.
5. Select **Deploy**, authorize if asked, and copy the URL ending in `/exec`.

Keep the spreadsheet itself private. Only the deployed script runs with your
Google account's access.

## 5. Connect local development

Copy `.env.example` to `.env.local` and set:

```dotenv
RSVP_APPS_SCRIPT_URL=https://script.google.com/macros/s/YOUR_DEPLOYMENT_ID/exec
RSVP_PROXY_SECRET=the-same-random-value-from-step-2
```

`.env.local` is ignored by Git. Restart `npm run web` (or `npm run dev`) after
changing it. The Vite development middleware forwards `/api/rsvp` to Apps
Script, so the browser never receives the secret.

## 6. Connect the deployed site on Vercel

In the Vercel project, open **Settings → Environment Variables** and add these
server-side variables for Production (and Preview if you use preview
deployments):

| Name | Value |
| --- | --- |
| `RSVP_APPS_SCRIPT_URL` | Your deployed `/exec` URL |
| `RSVP_PROXY_SECRET` | The same random value stored in Apps Script |

Save the variables and redeploy the site so the function receives them. They
must not be prefixed with `VITE_`; the `/api/rsvp` Vercel Function uses them on
the server. The browser only calls the same-origin `/api/rsvp` endpoint.

## 7. Test a submission

1. Open the invitation site and go to **RSVP**.
2. Select `2 Guests`, enter two distinct names, and select an attendance
   response.
3. Send the RSVP once and wait for the confirmation message.
4. Open the spreadsheet's `responces` tab. The first valid RSVP creates these
   headers: `Timestamp`, `Full Name`, `Attendance`, `Submission ID`.
5. Confirm that two rows were added, one per guest, with the same timestamp and
   submission ID. The attendance values are `Attending` or `Declined`.
6. Try the same page submission again only if you are checking the retry path;
   a network retry with the same request ID is idempotent and does not add rows.

The form also rejects missing names, duplicate names, missing attendance, and
more than five guests. A failed request leaves the entered values in place and
shows an error so the guest can retry.

## What the integration protects

- React sends JSON only to the same-origin API; it does not use `no-cors`.
- The Vercel Function signs the request with the server-only secret before
  forwarding it to Apps Script. Apps Script rejects direct unsigned requests.
- Apps Script validates guest count, name length, duplicate names, attendance,
  request ID, and the hidden honeypot before writing.
- A script lock serializes duplicate checks and writes. A deterministic,
  server-derived submission ID makes retries with the same request ID
  idempotent.
- Each guest's row is appended in one `setValues()` batch. Formula-like names
  are written as literal text.
- A lightweight per-IP hourly request limit is applied by Apps Script. It is
  intended for a small wedding RSVP form, not as a substitute for a managed
  abuse-prevention service under a large public attack.
