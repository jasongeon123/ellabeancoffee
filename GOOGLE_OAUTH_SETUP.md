# Google OAuth Setup Guide

This guide will walk you through setting up Google OAuth for your Ella Bean Coffee application.

## Step 1: Create a Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Click on the project dropdown at the top
3. Click "New Project"
4. Enter project name: `Ella Bean Coffee` (or your preferred name)
5. Click "Create"

## Step 2: Configure OAuth Consent Screen

1. In Google Cloud Console, navigate to **APIs & Services** → **OAuth consent screen**
2. Select **User Type**:
   - **External** - For public users (anyone with a Google account)
   - Click "Create"

### OAuth Consent Screen Configuration

#### **App Information**
- **App name**: `Ella Bean Coffee`
- **User support email**: Your email address (e.g., `geonJason@gmail.com`)
- **App logo** (optional): Upload your coffee shop logo (120x120px minimum)

#### **App Domain**
- **Application home page**: `https://ellabeancoffee.com` (or your domain)
- **Application privacy policy link**: `https://ellabeancoffee.com/privacy` (create this page)
- **Application terms of service link**: `https://ellabeancoffee.com/terms` (create this page)

#### **Authorized Domains**
Add your domains (without https://):
- `ellabeancoffee.com`
- `localhost` (for development)

#### **Developer Contact Information**
- **Email addresses**: Your email (e.g., `geonJason@gmail.com`)

3. Click **Save and Continue**

### Scopes Configuration

1. Click **Add or Remove Scopes**
2. Add these scopes (they should be pre-selected for basic Google Sign-In):
   - `.../auth/userinfo.email` - See your email address
   - `.../auth/userinfo.profile` - See your personal info
   - `openid` - Authenticate using OpenID Connect

3. Click **Update** then **Save and Continue**

### Test Users (if app is in Testing mode)

If your app is in "Testing" mode (recommended initially):

1. Click **Add Users**
2. Add email addresses of people who can test the sign-in:
   - Your email
   - Any team members or test users
3. Click **Add** then **Save and Continue**

### Summary

1. Review your settings
2. Click **Back to Dashboard**

## Step 3: Create OAuth 2.0 Credentials

1. Navigate to **APIs & Services** → **Credentials**
2. Click **+ Create Credentials** → **OAuth client ID**
3. Select **Application type**: **Web application**
4. **Name**: `Ella Bean Coffee Web Client`

### Authorized JavaScript Origins

Add these URLs:
- **Development**: `http://localhost:3000`
- **Production**: `https://ellabeancoffee.com`

### Authorized Redirect URIs

Add these URIs:
- **Development**: `http://localhost:3000/api/auth/callback/google`
- **Production**: `https://ellabeancoffee.com/api/auth/callback/google`

5. Click **Create**
6. **Copy your credentials**:
   - Client ID (looks like: `xxxxx.apps.googleusercontent.com`)
   - Client Secret (looks like: `GOCSPX-xxxxx`)

## Step 4: Add Credentials to Your Application

1. Open your `.env` file
2. Add the following:

```env
GOOGLE_CLIENT_ID="your-client-id-here.apps.googleusercontent.com"
GOOGLE_CLIENT_SECRET="GOCSPX-your-client-secret-here"
```

3. **Important**: Never commit your `.env` file to Git!

## Step 5: Publishing Your App

### Testing Mode (Current State)
- Limited to test users you've added
- No verification required
- Good for development and initial testing

### Publishing to Production
When you're ready to make it available to all users:

1. Go to **OAuth consent screen**
2. Click **Publish App**
3. For sensitive scopes, you may need to go through verification (takes 1-4 weeks)
4. For basic scopes (email, profile), publishing is instant

**Note**: Basic user info scopes don't require verification for most apps.

## Step 6: Test the Integration

1. Start your development server: `npm run dev`
2. Navigate to `http://localhost:3000/auth/signin`
3. Click "Sign in with Google"
4. You should see the Google consent screen
5. Sign in with a test user account
6. Grant permissions
7. You should be redirected back to your app and logged in

## Troubleshooting

### Error: "redirect_uri_mismatch"
- Make sure the redirect URI in Google Cloud Console exactly matches
- Check for trailing slashes, http vs https

### Error: "Access blocked: This app's request is invalid"
- Verify OAuth consent screen is configured
- Check that the app is published or user is added as test user

### Error: "invalid_client"
- Check that GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET are correct
- Make sure there are no extra spaces in .env file

### Users see "This app hasn't been verified"
- Normal for apps in testing or recently published
- Users can click "Advanced" → "Go to [App Name] (unsafe)" to proceed
- To remove this warning, submit for verification (if needed)

## Privacy Policy and Terms of Service

Google requires these for published apps. Create basic pages at:

- `/app/privacy/page.tsx` - Privacy policy
- `/app/terms/page.tsx` - Terms of service

You can use templates available online and customize them for your coffee shop.

## Security Best Practices

1. ✅ Never commit `.env` to Git (already in `.gitignore`)
2. ✅ Use different credentials for development and production
3. ✅ Regularly rotate your client secret
4. ✅ Monitor OAuth usage in Google Cloud Console
5. ✅ Only request scopes you actually need

## Next Steps

After Google OAuth is working:

- [ ] Create privacy policy page
- [ ] Create terms of service page
- [ ] Test with multiple Google accounts
- [ ] Consider adding other OAuth providers (Facebook, Apple, etc.)
- [ ] Set up production environment variables on Vercel
- [ ] Publish app when ready for public use

---

For more information, visit:
- [Google OAuth Documentation](https://developers.google.com/identity/protocols/oauth2)
- [NextAuth.js Google Provider](https://next-auth.js.org/providers/google)
