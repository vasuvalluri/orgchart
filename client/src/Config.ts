export const config = {
  appId: '8e7b76d2-09b8-4285-be9b-fe79ebe16cd4',
  authority: 'https://login.microsoftonline.com/ad5836f4-0d74-43cd-83c5-7e69eaa67915',
  redirectUri: process.env.REACT_APP_REDIRECT_URI,
  scopes: [
    'user.read',
    'Directory.Read.All',
    //'mailboxsettings.read',
    //'calendars.readwrite'
  ],
  BASE_URL: "/api", //process.env.REACT_APP_BASE_URL,
  IMAGE_URL: process.env.REACT_APP_IMAGE_URL
};