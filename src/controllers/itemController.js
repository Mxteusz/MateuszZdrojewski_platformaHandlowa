import db from "../data/db.js";

export const getItems = (req, res) => {
  db.query("SELECT * FROM items", (err, items) => {
    if (err) return res.status(500).send(err.message);
    res.render("marketplace", { items });
  });
};

export const buyItem = (req, res) => {
  const user = req.session?.user;
  const itemId = Number(req.body.itemId);

  if (!user) {
    return res.redirect("/login");
  }
  if (!itemId || Number.isNaN(itemId)) {
    return res.status(400).send("Missing or invalid item ID");
  }

  const userId = Number(user.id);

  db.query("SELECT * FROM items WHERE id = ?", [itemId], (err, items) => {
    if (err) return res.status(500).send(err.message);
    const item = items[0];
    if (!item) return res.status(404).send("Item not found");

    const itemPrice = Number(item.price);
    if (Number.isNaN(itemPrice)) return res.status(500).send("Invalid item price");

    db.query("SELECT balance FROM users WHERE id = ?", [userId], (err2, users) => {
      if (err2) return res.status(500).send(err2.message);
      const currentUser = users[0];
      if (!currentUser) return res.status(404).send("User not found");

      const currentBalance = Number(currentUser.balance);
      if (Number.isNaN(currentBalance)) return res.status(500).send("Invalid user balance");

      if (currentBalance < itemPrice) return res.status(400).send("Not enough balance");

      db.query(
        "SELECT * FROM user_items WHERE user_id = ? AND item_id = ?",
        [userId, itemId],
        (err3, existing) => {
          if (err3) return res.status(500).send(err3.message);
          if (existing.length) return res.status(400).send("Already owned");

          db.query("INSERT INTO user_items (user_id, item_id) VALUES (?, ?)", [userId, itemId], (err4) => {
            if (err4) return res.status(500).send(err4.message);

            db.query("UPDATE users SET balance = balance - ? WHERE id = ?", [itemPrice, userId], (err5) => {
              if (err5) return res.status(500).send(err5.message);

              db.query(
                "INSERT INTO transactions (buyer_id, item_id, price) VALUES (?, ?, ?)",
                [userId, itemId, itemPrice],
                (err6) => {
                  if (err6) return res.status(500).send(err6.message);
                  res.redirect(`/users/${userId}`);
                }
              );
            });
          });
        }
      );
    });
  });
};