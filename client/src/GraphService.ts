//import moment, { Moment } from 'moment';
//import { Event } from 'microsoft-graph';
//import { GraphRequestOptions, PageCollection, PageIterator } from '@microsoft/microsoft-graph-client';


var graph = require('@microsoft/microsoft-graph-client');

function getAuthenticatedClient(accessToken: string) {
  // Initialize Graph client
  const client = graph.Client.init({
    // Use the provided access token to authenticate
    // requests
    authProvider: (done: any) => {
      done(null, accessToken);
    }
  });

  return client;
}

export async function getUserDetails(accessToken: string) {
  const client = getAuthenticatedClient(accessToken);

  const user = await client
    .api('/me')
    // .select('displayName,mail,mailboxSettings,userPrincipalName')
    //.select('displayName,userPrincipalName')
    .get();
  const string = {
    securityEnabledOnly: true
  };
  const memberGroups = await client
    .api('/me/getMemberGroups')
    .post(string);
  const directoryObject = {
    ids: memberGroups.value,
    types: ['group']
  };
  const groupNames = await client.api('/directoryObjects/getByIds')
    .post(directoryObject);

  //console.log('User', memberGroups);
  //console.log('Groups', groupNames);
  return user;
}

export async function getAllUsers(accessToken: string) {
  const client = getAuthenticatedClient(accessToken);
  const user = await client
    .api('/users')
    // .select('displayName,mail,mailboxSettings,userPrincipalName')
    .select('displayName,userPrincipalName')
    .get();
  //console.log(user);
  return user;
}

export function getUserByName(accessToken: string, firstName: string, lastName: string) {
  const client = getAuthenticatedClient(accessToken);
  return new Promise<any[]>((resolve, reject) => {
    client
      .api(`/users?$filter=startsWith(surname,'${lastName}') and startsWith(givenName,'${firstName}') `)
      // .select('displayName,mail,mailboxSettings,userPrincipalName')
      //.select('displayName,userPrincipalName')
      .get((error: any, result: any, rawResponse?: any) => {
        console.info("** 2");
        resolve(result);
        return result;
      });
  });
  /*const user = await client
    .api(`/users?$filter=startsWith(surname,'${lastName}') and startsWith(givenName,'${firstName}') `)
    // .select('displayName,mail,mailboxSettings,userPrincipalName')
    //.select('displayName,userPrincipalName')
    .get();
  if (user.value == undefined) {
    console.log('Name not found:' + lastName + ' ' + firstName);
    return 1;
  } else {
    return user.value[0];
  }*/
}

export function getPhoto(accessToken: string, id: string) {
  const client = getAuthenticatedClient(accessToken);
  return new Promise<any[]>((resolve, reject) => {
    client
      .api(`/users/${id}/photos/48x48/$value`)
      // .select('displayName,mail,mailboxSettings,userPrincipalName')
      //.select('displayName,userPrincipalName')
      .get(async (error: any, result: any, rawResponse?: any) => {
        console.info("** 4");
        resolve(result);
      })
  });
}

export function getMyPhoto(accessToken: string) {
  const client = getAuthenticatedClient(accessToken);
  return new Promise<any[]>((resolve, reject) => {
    client
      .api(`/me/photos/48x48/$value`)
      .get(async (error: any, result: any, rawResponse?: any) => {
        resolve(result);
      })
  });
}
export function getPhotos(accessToken: string, firstName: string, lastName: string) {
  const client = getAuthenticatedClient(accessToken);
  client
    .api(`/users?$filter=startsWith(surname,'${lastName}') and startsWith(givenName,'${firstName}') `)
    .get().then((result: any) => {
      return client
        .api(`/users/${result.value[0].id}/photos/48x48/$value`)
        .get().then((photo: any) => {
          if (photo !== undefined) {
            const url = window.URL || window.webkitURL;
            const strURL = url.createObjectURL(photo);
            return strURL;
          }
          else {
            return null;
          }
        }).catch((error: any) => {
          return null;
        });

    });
}
export async function getPhoneEmail(accessToken: string, names: {}) {
  const client = getAuthenticatedClient(accessToken);
  //const url = window.URL || window.webkitURL;
  let results: { [key: string]: string[] } = {};
  let queryUrl, lastName, firstName = "";
  for (const [key, value] of Object.entries(names)) {
    firstName = (value as string).split(" ")[0];
    lastName = (value as string).split(" ")[1];
    let id: string = key as string;
    queryUrl = `/users?$filter=startsWith(surname,'${lastName}') and startsWith(givenName,'${firstName}') and mail ge ' ' `;
    let userInfo: any = "";

    results[id] = await client.api(queryUrl).get().then((result: any) => {
      userInfo = result.value[0];
      return userInfo;
    }).catch((error: any) => {
      console.log("PhoneEmailError:", error);
      userInfo = null;
      //return userInfo;
    });
  }
  return results;
}

/*function AvatarImage(d: any, letters: any, size: any) {
  const initials = firstName.substr(0, 1) + lastName.substring(0, 1);

  let canvas: HTMLCanvasElement;
  let context: any;

  canvas = d.createElement('canvas');
  context = canvas.getContext("2d");
  //context = canvas.getContext("2d");
  var size = size || 60;

  // Generate a random color every time function is called
  var color = "#" + (Math.random() * 0xFFFFFF << 0).toString(16);

  // Set canvas with & height
  canvas.width = size;
  canvas.height = size;

  // Select a font family to support different language characters
  // like Arial
  context.font = Math.round(canvas.width / 2) + "px Arial";
  context.textAlign = "center";

  // Setup background and front color
  context.fillStyle = "#FFF";// color;
  context.fillRect(0, 0, canvas.width, canvas.height);
  context.fillStyle = color;//"#FFF";
  context.fillText(letters, size / 2, size / 1.5);

  // Set image representation in default format (png)
  let dataURI = canvas.toDataURL();

  // Dispose canvas element
  canvas.remove();
  return dataURI;
}
client
        .api(`/users/${userInfo.id}/photos/48x48/$value`)
        .get().then((photo: any) => {
          if (photo != undefined) {
            photoURL = url.createObjectURL(photo);
          }
          else {
            photoURL = AvatarImage(document, initials, 50);
          }
          return [userInfo, photoURL];
        }).catch((error: any) => {
          photoURL = AvatarImage(document, initials, 50);
          return [userInfo, photoURL];
        });
*/