# HubSpot Form for Squarespace - Setup Guide

This guide is designed for web administrators who are comfortable with HTML but may not be developers.

## What You'll Need

Before you begin, gather these from your HubSpot account:

- **Portal ID** - Found in Settings → Account Setup → Account Defaults
- **Form GUID** - Found in Marketing → Forms → [Your Form] → Settings
- **Subscription IDs** (if using email subscriptions) - Found in your form's subscription settings

## Quick Setup (5 Minutes)

### Step 1: Add the Script to Your Squarespace Site

1. Go to **Settings → Advanced → Code Injection**
2. Paste this code in the **Footer** section:

```html
<script src="https://unpkg.com/@greatnessinabox/hubspot-form@latest/dist/vanilla/index.js" type="module"></script>
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
4. Paste this HTML (replace the values in ALL CAPS):

```html
<form id="hubspot-contact-form" data-hubspot-form>
  <div class="form-field">
    <label for="firstName">First Name *</label>
    <input type="text" id="firstName" name="firstName" required>
  </div>

  <div class="form-field">
    <label for="lastName">Last Name *</label>
    <input type="text" id="lastName" name="lastName" required>
  </div>

  <div class="form-field">
    <label for="email">Email *</label>
    <input type="email" id="email" name="email" required>
  </div>

  <div class="form-field">
    <label for="phoneNumber">Phone Number (Optional)</label>
    <div style="display: flex; gap: 10px;">
      <select id="countryCode" name="countryCode" style="width: 120px;">
        <option value="+1">+1 US</option>
        <option value="+44">+44 UK</option>
        <option value="+61">+61 AU</option>
        <!-- Add more country codes as needed -->
      </select>
      <input type="tel" id="phoneNumber" name="phoneNumber" style="flex: 1;">
    </div>
  </div>

  <div class="form-field">
    <label style="display: flex; align-items: start; gap: 8px;">
      <input type="checkbox" id="agreeToUpdates" name="agreeToUpdates" value="true" required>
      <span>I agree to receive updates *</span>
    </label>
  </div>

  <button type="submit" style="padding: 12px 24px; background: #000; color: #fff; border: none; cursor: pointer;">
    Submit
  </button>

  <div id="form-message" style="margin-top: 16px; display: none;"></div>
</form>

<style>
  #hubspot-contact-form {
    max-width: 600px;
    margin: 0 auto;
  }
  .form-field {
    margin-bottom: 20px;
  }
  .form-field label {
    display: block;
    margin-bottom: 8px;
    font-weight: 500;
  }
  .form-field input[type="text"],
  .form-field input[type="email"],
  .form-field input[type="tel"],
  .form-field select {
    width: 100%;
    padding: 10px;
    border: 1px solid #ddd;
    border-radius: 4px;
    font-size: 16px;
  }
  .hubspot-form-error {
    color: #d32f2f;
    font-size: 14px;
    margin-top: 4px;
  }
  button:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
</style>

<script type="module">
  import { initHubSpotForm } from 'https://unpkg.com/@greatnessinabox/hubspot-form@latest/dist/vanilla/index.js';

  initHubSpotForm({
    portalId: 'YOUR_PORTAL_ID_HERE',
    formGuid: 'YOUR_FORM_GUID_HERE',
    formId: 'hubspot-contact-form',
    submissionMethod: 'direct',
    validation: {
      requiredFields: ['firstName', 'lastName', 'email']
    },
    legalConsent: {
      subscriptions: [
        {
          id: 'YOUR_SUBSCRIPTION_ID_HERE',
          fieldName: 'agreeToUpdates',
          text: 'I agree to receive updates',
          required: true
        }
      ]
    },
    onSuccess: (data) => {
      const messageEl = document.getElementById('form-message');
      messageEl.style.display = 'block';
      messageEl.style.color = '#4caf50';
      messageEl.textContent = 'Thank you! Your form has been submitted successfully.';
      document.getElementById('hubspot-contact-form').reset();
    },
    onError: (error) => {
      const messageEl = document.getElementById('form-message');
      messageEl.style.display = 'block';
      messageEl.style.color = '#d32f2f';
      messageEl.textContent = 'There was an error submitting your form. Please try again.';
    }
  });
</script>
```

### Step 3: Replace the Placeholder Values

Find and replace these values in the code above:

- `YOUR_PORTAL_ID_HERE` → Your HubSpot Portal ID
- `YOUR_FORM_GUID_HERE` → Your HubSpot Form GUID
- `YOUR_SUBSCRIPTION_ID_HERE` → Your subscription ID (if using)

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
    fieldName: 'agreeToUpdates',
    text: 'I agree to receive updates',
    required: true
  },
  {
    id: 'SUBSCRIPTION_ID_2',
    fieldName: 'agreeToNewsletter',
    text: 'Subscribe to newsletter',
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
