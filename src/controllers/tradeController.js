import db from "../data/db.js";

export const tradeItem = (req, res) => {
  const sellerId = Number(req.body.sellerId);
  const buyerId = Number(req.body.buyerId);
  const itemId = Number(req.body.itemId);
  const price = Number(req.body.price);

  if (!sellerId || !buyerId || !itemId || Number.isNaN(price)) {
    return res.status(400).send("Invalid trade data");
  }

  db.query("SELECT * FROM users WHERE id = ?", [sellerId], (err, sellers) => {
    if (err) return res.status(500).send(err.message);
    const seller = sellers[0];
    if (!seller) return res.status(404).send("Seller not found");

    db.query("SELECT * FROM users WHERE id = ?", [buyerId], (err2, buyers) => {
      if (err2) return res.status(500).send(err2.message);
      const buyer = buyers[0];
      if (!buyer) return res.status(404).send("Buyer not found");

      const buyerBalance = Number(buyer.balance);
      if (Number.isNaN(buyerBalance)) return res.status(500).send("Invalid buyer balance");
      if (buyerBalance < price) return res.status(400).send("Buyer lacks funds");

      db.query(
        "SELECT * FROM user_items WHERE user_id = ? AND item_id = ?",
        [sellerId, itemId],
        (err3, ownsItem) => {
          if (err3) return res.status(500).send(err3.message);
          if (!ownsItem.length) return res.status(400).send("Seller does not own the item");

          db.query(
            "UPDATE user_items SET user_id = ? WHERE user_id = ? AND item_id = ?",
            [buyerId, sellerId, itemId],
            (err4) => {
              if (err4) return res.status(500).send(err4.message);

              db.query("UPDATE users SET balance = balance + ? WHERE id = ?", [price, sellerId], (err5) => {
                if (err5) return res.status(500).send(err5.message);

                db.query("UPDATE users SET balance = balance - ? WHERE id = ?", [price, buyerId], (err6) => {
                  if (err6) return res.status(500).send(err6.message);

                  db.query(
                    "INSERT INTO transactions (buyer_id, seller_id, item_id, price) VALUES (?, ?, ?, ?)",
                    [buyerId, sellerId, itemId, price],
                    (err7) => {
                      if (err7) return res.status(500).send(err7.message);
                      res.send("Trade completed");
                    }
                  );
                });
              });
            }
          );
        }
      );
    });
  });
};