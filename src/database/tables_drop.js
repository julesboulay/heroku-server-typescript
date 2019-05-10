// Use line below from index.js to create tables.
// require("./database/tables_drop")(connection);

module.exports = connection => {
  var tables = [
    { name: "Post", sql: `DROP TABLE Post;` },
    { name: "ConfirmMarzocco", sql: `DROP TABLE ConfirmMarzocco;` },
    { name: "User", sql: `DROP TABLE User;` },

    { name: "ImgQueueItem", sql: `DROP TABLE ImgQueueItem;` },
    { name: "DwlQueueItem", sql: `DROP TABLE DwlQueueItem;` },
    { name: "ReviewHit", sql: `DROP TABLE ReviewHit;` },
    { name: "EvaluatedPicture", sql: `DROP TABLE EvaluatedPicture;` },
    { name: "Evaluation", sql: `DROP TABLE Evaluation;` },
    { name: "Cafe", sql: `DROP TABLE Cafe;` }
  ];

  tables.map(table => {
    connection.query(table.sql, function(error, result) {
      if (error) throw error;
      console.log("Table " + table.name + " Dropped");
    });
  });
};
