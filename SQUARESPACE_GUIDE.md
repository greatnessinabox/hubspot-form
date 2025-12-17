# HubSpot Form for Squarespace - Setup Guide

This guide is designed for web administrators who are comfortable with HTML but may not be developers.

## What You'll Need

Before you begin, gather these from your HubSpot account:

- **Form GUID** - Found in Marketing → Forms → [Your Form] → Settings
- **Artist subscription ID** - Found in the form’s Privacy and consent → Communication subscriptions (required checkbox)

## Quick Setup (5 Minutes)

### Step 1: Add the Script to Your Squarespace Site

1. Go to **Settings → Advanced → Code Injection**
2. Paste this code in the **Footer** section:

```html
<script src="https://unpkg.com/@greatnessinabox/hubspot-form@latest/dist/vanilla/index.mjs" type="module"></script>
```

**OR** if you prefer to host it yourself, download the file and upload it to your Squarespace site, then reference it:

```html
<script src="/s/hubspot-form.js" type="module"></script>
```

### Step 2: Create Your Form HTML

Add a **Code Block** to your Squarespace page where you want the form to appear:

1. Click **Edit** on your page
2. Click **+ Add Block**
3. Choose **Code**
4. Paste the full template from `examples/squarespace-example.html` (it’s kept in sync with UNITED and includes a themeable default-light style).

### Step 3: Replace the Placeholder Values

Find and replace these values in the code above:

- `YOUR_FORM_GUID` → Your HubSpot Form GUID
- `YOUR_ARTIST_SUBSCRIPTION_ID` → The artist subscription ID (required checkbox)
- `ARTIST_NAME` → The artist name shown in the required checkbox label/text

Optional:

- Set `data-hsf-theme="dark"` on the `<form ...>` for a UNITED-like dark theme (default is `light`).

### Step 4: Save and Test

1. Click **Save** on your Squarespace page
2. Visit the page and test the form
3. Check your HubSpot account to confirm the submission was received

## Customization Options

### Change Form Fields

To add or remove fields, modify the HTML form section. Make sure the `name` attribute matches what HubSpot expects:

```html
<!-- Add a company field -->
<div class="form-field">
  <label for="company">Company</label>
  <input type="text" id="company" name="company">
</div>
```

### Change Styling

Modify the `<style>` section to match your Squarespace site's design:

```css
/* Example: Match your site's colors */
button {
  background: #YOUR_COLOR;
  color: #YOUR_TEXT_COLOR;
}
```

### Add More Subscriptions

In the `legalConsent.subscriptions` array, add more subscription options:

```javascript
subscriptions: [
  {
    id: 'SUBSCRIPTION_ID_1',
    fieldName: 'agreeArtistUpdates',
    text: 'I agree to receive updates about ARTIST_NAME.',
    required: true
  },
  {
    id: 'SUBSCRIPTION_ID_2',
    fieldName: 'agreeAnotherlandUpdates',
    text: 'I agree to receive updates about Anotherland.',
    required: false
  }
]
```

Don't forget to add the corresponding checkbox in your HTML form!

## Troubleshooting

### Form Not Submitting

1. **Check Browser Console**: Press F12 → Console tab → Look for error messages
2. **Verify Portal ID and Form GUID**: Double-check these values are correct
3. **Check Required Fields**: Make sure all required fields are filled

### Form Submits But Data Doesn't Appear in HubSpot

1. **Check Form Settings**: In HubSpot, verify the form is set to accept submissions
2. **Check Field Names**: Ensure form field names match HubSpot field names
3. **Check Consent Settings**: Verify consent/subscription settings match your form configuration

### Script Not Loading

1. **Check Code Injection**: Make sure the script is in the Footer section
2. **Check URL**: Verify the CDN URL is correct
3. **Try Self-Hosting**: Download the file and upload to Squarespace if CDN is blocked

## Advanced: Using a Proxy Endpoint

If you need to use a proxy endpoint (for server-side processing), change `submissionMethod`:

```javascript
submissionMethod: 'proxy',
proxyEndpoint: 'https://your-domain.com/api/submit-form'
```

## Need Help?

If you encounter issues:

1. Check the browser console for error messages
2. Verify all configuration values are correct
3. Test with a simple form first, then add complexity

---

## Quick Reference: Where to Find HubSpot Values

### Portal ID

1. Log into HubSpot
2. Go to **Settings** (gear icon)
3. Click **Account Setup** → **Account Defaults**
4. Portal ID is shown at the top

### Form GUID

1. Go to **Marketing** → **Forms**
2. Click on your form
3. Click **Settings** tab
4. Form GUID is in the URL or under "Form ID"

### Subscription IDs

1. Go to your form → **Settings** → **Privacy and consent**
2. Click on a subscription
3. Subscription ID is in the URL or settings
