const { getRatings, insertRating, deleteRating } = require('../models/ratingModel');

const getRatingsForSong = async (req, res) => {
  const { song } = req.query;
  if (!song) return res.status(400).json({ error: 'song param required' });

  try {
    const data = await getRatings(song, req.ip);
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const rateSong = async (req, res) => {
  const { song_id, rating } = req.body;
  if (!song_id || ![1, -1].includes(rating)) {
    return res.status(400).json({ error: 'song_id and rating (1 or -1) required' });
  }

  const fingerprint = req.ip;
  try {
    const current = await getRatings(song_id, fingerprint);

    if (current.userVote === rating) {
      // Same button clicked again → remove vote (toggle off)
      await deleteRating(song_id, fingerprint);
    } else {
      // No vote or switching sides → insert (conflict = already handled by delete above)
      await deleteRating(song_id, fingerprint); // clear any existing opposite vote first
      await insertRating(song_id, fingerprint, rating);
    }

    const data = await getRatings(song_id, fingerprint);
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

module.exports = { getRatingsForSong, rateSong };
