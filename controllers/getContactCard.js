const contactCard = require("../db_apis/getContactCard.js");

async function get(req, res, next) {
  try {
    const context = {};
    context.givenName = req.params.givenName;
    context.surname = req.params.surname;

    const rows = await contactCard.get_contact_card(context);
    if (req.params.id) {
      if (rows.length === 1) {
        res.status(200).json(rows[0]);
      } else {
        res.status(404).end();
      }
    } else {
      res.status(200).json(rows);
    }
  } catch (err) {
    next(err);
  }
}

module.exports.get = get;
