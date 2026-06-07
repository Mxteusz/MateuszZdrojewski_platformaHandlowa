import db from "../data/db.js";
import { hashPassword, comparePassword } from "../services/cryptoService.js";

export const registerUser = (req, res) => {
  const { username, password } = req.body;
  const hashed = hashPassword(password);
  const starterBalance = 100;

  db.query(
    "INSERT INTO users (username, password, balance) VALUES (?, ?, ?)",
    [username, hashed, starterBalance],
    (err, result) => {
      if (err) return res.status(500).send(err.message);
      res.redirect("/login");
    }
  );
};

export const loginUser = (req, res) => {
  const { username, password } = req.body;

  db.query(
    "SELECT * FROM users WHERE username = ?",
    [username],
    (err, results) => {
      if (err) return res.status(500).send(err.message);

      const user = results[0];
      if (!user || !comparePassword(password, user.password)) {
        return res.status(400).send("Invalid credentials");
      }

      if (user.balance <= 0) {
        const defaultBalance = 1000;
        db.query(
          "UPDATE users SET balance = ? WHERE id = ?",
          [defaultBalance, user.id],
          (err2) => {
            if (err2) return res.status(500).send(err2.message);
            req.session.user = {
              id: user.id,
              username: user.username,
            };
            res.redirect(`/users/${user.id}`);
          }
        );
      } else {
        req.session.user = {
          id: user.id,
          username: user.username,
        };
        res.redirect(`/users/${user.id}`);
      }
    }
  );
};

export const getUserProfile = (req, res) => {
  const { id } = req.params;

  db.query("SELECT * FROM users WHERE id = ?", [id], (err, results) => {
    if (err) return res.status(500).send(err.message);

    const user = results[0];
    db.query(
      `SELECT items.* FROM items
       JOIN user_items ON items.id = user_items.item_id
       WHERE user_items.user_id = ?`,
      [id],
      (err2, games) => {
        if (err2) return res.status(500).send(err2.message);
        res.render("user", { user, games });
      }
    );
  });
};

export const topUpUser = (req, res) => {
  const sessionUser = req.session?.user;
  if (!sessionUser) {
    return res.redirect("/login");
  }

  const topUpAmount = 100;
  db.query(
    "UPDATE users SET balance = balance + ? WHERE id = ?",
    [topUpAmount, sessionUser.id],
    (err) => {
      if (err) return res.status(500).send(err.message);
      res.redirect(`/users/${sessionUser.id}`);
    }
  );
};