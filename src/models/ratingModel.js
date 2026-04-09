const pool = require("../config/db");

const getRatings = async (songId, fingerprint) => {
  // Count ups, downs, and this user's vote in one pass
  const { rows } = await pool.query(
    `SELECT
       COALESCE(SUM(CASE WHEN rating = 1  THEN 1 ELSE 0 END), 0) AS up,
       COALESCE(SUM(CASE WHEN rating = -1 THEN 1 ELSE 0 END), 0) AS down,
       MAX(CASE WHEN user_fingerprint = $2 THEN rating END) AS user_vote
     FROM ratings WHERE song_id = $1`,
    [songId, fingerprint],
  );
  return {
    up: Number(rows[0].up),
    down: Number(rows[0].down),
    userVote: rows[0].user_vote ?? null,
  };
};

const insertRating = async (songId, fingerprint, rating) => {
  await pool.query(
    `INSERT INTO ratings (song_id, user_fingerprint, rating)
     VALUES ($1, $2, $3)
     ON CONFLICT (song_id, user_fingerprint) DO NOTHING`,
    [songId, fingerprint, rating],
  );
};

const deleteRating = async (songId, fingerprint) => {
  await pool.query(
    "DELETE FROM ratings WHERE song_id = $1 AND user_fingerprint = $2",
    [songId, fingerprint],
  );
};

module.exports = { getRatings, insertRating, deleteRating };
