const axios = require("axios");
var graph = require("@microsoft/microsoft-graph-client");
const fetch = require("isomorphic-fetch");
const fs = require("fs");
// { createCanvas } = require("canvas");
function getAuthenticatedClient(accessToken) {
  const client = graph.Client.init({
    authProvider: (done) => {
      done(null, accessToken);
    },
  });
  return client;
}

/**
 * Calls the endpoint with authorization bearer token.
 * @param {string} endpoint
 * @param {string} accessToken
 */
async function callApi(endpoint, accessToken) {
  const options = {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  };
  const client = getAuthenticatedClient(accessToken);

  // console.log("request made to web API at: " + new Date().toString());
  let response = "";
  let usersList = [];
  try {
    while (endpoint != null) {
      response = await axios.default.get(endpoint, options);
      endpoint = response.data["@odata.nextLink"];
      //endpoint = null;
      response.data.value.forEach(async (element) => {
        usersList.push(element);
        try {
          photo = await client
            .api(`/users/${element.id}/photos/48x48/$value`)
            .get();
          console.log(
            "Creating Photo for:",
            `${element.givenName}${element.surname}`
          );
          const ab = await photo.arrayBuffer();
          try {
            const fileName = `${element.givenName}${element.surname}`;
            await fs
              .createWriteStream(
                `./services/pics/${fileName
                  .replace("/", "")
                  .replace(" ", "")}.jpeg`
              )
              .write(Buffer.from(ab));
          } catch (error) {
            //console.error("Creating Photo Error", error.message);
          }
        } catch (error) {
          /*if (element.surname != null && element.givenName != null) {
            const fileName = `${element.givenName}${element.surname}`;
            console.error("Generating Avatar for:", fileName, error.message);

            AvatarImage(
              `${element.givenName.substr(0, 1)}${element.surname.substr(
                0,
                1
              )}`,
              48,
              fileName.replace("/", "").replace(" ", "")
            );
          }*/
        }
      });
    }
    //console.log(usersList.length);
    return usersList;
  } catch (error) {
    console.log(error);
    return error;
  }
}
async function callPhotoApi(endpoint, accessToken) {
  const options = {
    headers: {
      Authorization: `Bearer ${accessToken}`,
      responseType: "json",
      contentType: "image/jpeg",
    },
  };

  // console.log("request made to web API at: " + new Date().toString());

  try {
    const response = await axios.default.get(endpoint, options);
    return response.data;
  } catch (error) {
    console.log(error);
    return null;
  }
}

/*function AvatarImage(letters, size, name) {
  console.log("Avatar....", name);
  const canvas = createCanvas(size, size);
  const context = canvas.getContext("2d");

  var size = size || 60;

  // Generate a random color every time function is called
  const rand = Math.random();
  var color1 = "#" + ((rand * 0xffffff) << 0).toString(16);
  var color2 = "#" + ((rand * 0xf0f0f0) << 0).toString(16);

  // Set canvas with & height
  canvas.width = size;
  canvas.height = size;

  // Select a font family to support different language characters
  // like Arial
  context.font = Math.round(canvas.width / 2) + "px Arial";
  context.textAlign = "center";

  // Setup background and front color
  context.fillStyle = color2;
  context.fillRect(0, 0, canvas.width, canvas.height);
  context.fillStyle = color1; //"#FFF";
  context.fillText(letters, size / 2, size / 1.5);
  const buffer = canvas.toBuffer("image/jpeg");
  fs.writeFileSync(`./services/pics/${name}.jpeg`, buffer);
}*/

module.exports = {
  callApi: callApi,
  callPhotoApi: callPhotoApi,
};
