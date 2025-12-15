import { Configuration, PopupRequest } from '@azure/msal-browser'

export const msalConfig: Configuration = {
  auth: {
    clientId: process.env.NEXT_PUBLIC_MICROSOFT_CLIENT_ID || '',
    authority: process.env.NEXT_PUBLIC_MICROSOFT_AUTHORITY || 'https://login.microsoftonline.com/common',
    redirectUri: process.env.NEXT_PUBLIC_MICROSOFT_REDIRECT_URI || 'http://localhost:3000',
  },
  cache: {
    cacheLocation: 'sessionStorage',
    storeAuthStateInCookie: false,
  },
}

export const loginRequest: PopupRequest = {
  scopes: ['User.Read', 'Tasks.Read', 'Tasks.ReadWrite'],
}

export const graphConfig = {
  graphMeEndpoint: 'https://graph.microsoft.com/v1.0/me',
  graphTaskListsEndpoint: 'https://graph.microsoft.com/v1.0/me/todo/lists',
}