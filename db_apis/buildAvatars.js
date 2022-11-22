const fetchUsers = require("./graphFetch");
const auth = require("./graphAuth");
const fetch = require("isomorphic-fetch");
const fs = require("fs");
//  { createCanvas } = require("canvas");
var graph = require("@microsoft/microsoft-graph-client");
function getAuthenticatedClient(accessToken) {
  const client = graph.Client.init({
    authProvider: (done) => {
      done(null, accessToken);
    },
  });
  return client;
}

async function create_avatars() {
  //  try {
  const authResponse = await auth.getToken(auth.tokenRequest);
  const client = getAuthenticatedClient(authResponse.accessToken);

  const response = await fetchUsers.callApi(
    auth.apiConfig.usersWithEmail,
    authResponse.accessToken
  );

  response.forEach(async (element) => {
    if (element.surname != null) {
      try {
        photo = await client
          .api(`/users/${element.id}/photos/48x48/$value`)
          .get();
        if (photo != null) {
          const ab = await photo.arrayBuffer();
          try {
            const fileName = `${element.givenName}${element.surname}`;
            if (ab.length > 0) {
              await fs
                .createWriteStream(
                  `./services/pics/${fileName
                    .replace("/", "")
                    .replace(" ", "")}.jpeg`
                )
                .write(Buffer.from(ab));
              console.log(
                "CreatingFile",
                `./services/pics/${element.givenName}${element.surname}.jpeg`
              );
            }
          } catch (error) {
            console.log("Saving file:", error);
          }
        } else {
          const fileName = `${element.givenName}${element.surname}`;
          AvatarImage(
            `${element.givenName.substr(0, 1)}${element.surname.substr(0, 1)}`,
            48,
            fileName.replace("/", "").replace(" ", "")
          );
        }
      } catch (error) {
        console.error(error.message);
        /*const fileName = `${element.givenName}${element.surname}`;
        if (element.surname != null && element.givenName != null) {
          AvatarImage(
            `${element.givenName.substr(0, 1)}${element.surname.substr(0, 1)}`,
            48,
            fileName.replace("/", "").replace(" ", "")
          );
        } */
      }
    } else {
      console.log("Not found", element.displayName);
    }
  });
  return null;
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
module.exports.create_avatars = create_avatars;
