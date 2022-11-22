const buildAvatars = require("../db_apis/buildAvatars");
const buildBaseData = require("../db_apis/buildBaseData");
const buildExceptions = require("../db_apis/buildExceptions");
const buildChildCounts = require("../db_apis/buildChildCounts");

async function generate_files() {
  buildBaseData.create_base_data_file();
  //buildExceptions.create_exceptions_file();
  buildChildCounts.create_child_counts_file();
  //await buildAvatars.create_avatars();
  //return data;
}
module.exports.generate_files = generate_files;
