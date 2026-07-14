# LetsEat Chrome Extension: add-recipes

This extension lets a user add the current page as a recipe into LetsEat.

## Current MVP behavior

- Reads active tab URL.
- Calls LetsEat API to check whether URL is parseable.
- Shows preview metadata when parseable.
- Imports recipe into authenticated user account via Bearer token.

## Expected LetsEat API endpoints

- `GET /api/extension/me`
- `POST /api/extension/recipe/preview`
- `POST /api/extension/recipe/import`

All endpoints require:

- `Authorization: Bearer <token>`
- `Accept: application/json`

## Load in Chrome

1. Open `chrome://extensions`.
2. Enable Developer mode.
3. Click Load unpacked.
4. Select this folder: `chrome-extension/add-recipes`.

## Configure

1. Open extension settings page.
2. Paste personal access token.
3. Optional: expand Advanced to override base URL for local/dev.
4. Click Test Connection.

## Notes

- Token is stored in `chrome.storage.local`.
- Use short-lived or revokable tokens from LetsEat profile settings.
- Production base URL defaults to `https://recipes.andrewhuggins.com`.
- Disconnect removes the stored token from this browser.
