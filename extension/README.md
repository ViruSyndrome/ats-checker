# GetATSReady JD Grabber (Chrome extension)

Helps you paste a job description into [GetATSReady](https://www.getatsready.com) faster. It does **not** bypass any ATS, does not submit applications, and needs **no account**.

## Load unpacked (Chrome)

1. Open Chrome → **Extensions** (`chrome://extensions`).
2. Turn on **Developer mode** (top right).
3. Click **Load unpacked**.
4. Select this folder: `ATS-Checker/extension` (the folder that contains `manifest.json`).
5. Pin the extension if you like.

## Use

1. Open a job posting (LinkedIn, Greenhouse, Lever, Ashby, or similar).
2. Click the extension → **Send to GetATSReady**.
3. A GetATSReady tab opens with the JD filled (via `chrome.storage.local`, with `#jd=` hash as a backup for shorter text).
4. Upload your resume and run the local scan as usual.

**Copy JD only** puts the text on the clipboard without opening the site.

## Permissions

- `activeTab` / `scripting` — read the job description from the page you are viewing when you click the button.
- Host access for LinkedIn, Greenhouse, Lever, Ashby, and getatsready.com — extract JD and deliver it to the checker page.
- `storage` — pass the JD to the GetATSReady tab without stuffing a huge query string.

## Privacy

JD text stays in your browser (extension storage / URL hash). Nothing is posted to GetATSReady servers by the extension itself.

## Deploy note

This `extension/` folder is excluded from GitHub Pages publishes (`deploy-pages.yml`). Keep it in git so others can load unpacked from the repo.
