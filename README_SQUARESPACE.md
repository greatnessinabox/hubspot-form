# HubSpot Form for Squarespace - Quick Start

**This guide is designed for web administrators - no coding experience needed!**

## What You'll Need

Before starting, get these from HubSpot:

- **Form GUID** - Marketing → Forms → [Your Form] → Settings
- **Artist subscription ID** - Form Settings → Privacy and consent → Communication subscriptions (required checkbox)

## 3-Step Setup

### Step 1: Add Code Block to Your Page

1. Edit your Squarespace page
2. Click **+ Add Block** → **Code**
3. Copy the entire code from [squarespace-example.html](./examples/squarespace-example.html)

### Step 2: Replace Placeholder Values

Find and replace these in the code:

- `YOUR_FORM_GUID` → Your HubSpot Form GUID
- `YOUR_ARTIST_SUBSCRIPTION_ID` → The artist subscription ID (required checkbox)
- `ARTIST_NAME` → The artist name shown in the required checkbox label/text and the hidden `temp_artist_association` field
- `REDIRECT_URL` → (Optional) A URL to redirect to after submission (e.g. a YouTube video). Leave as `""` to show the default thank-you message

### Step 3: Save and Test

1. Click **Save**
2. Test the form on your live site
3. Check HubSpot to confirm submission received

## That's It! 🎉

The form will automatically:

- ✅ Validate required fields
- ✅ Submit to HubSpot
- ✅ Show success/error messages
- ✅ Handle cookies for contact linking

## Need More Help?

See the full [Squarespace Guide](./SQUARESPACE_GUIDE.md) for:

- Customization options
- Troubleshooting
- Advanced features

## Customization

Want to change the styling? Just edit the `<style>` section in the code block to match your site's design!
