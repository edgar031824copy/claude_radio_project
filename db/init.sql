CREATE TABLE IF NOT EXISTS ratings (
  song_id          TEXT NOT NULL,
  user_fingerprint TEXT NOT NULL,
  rating           SMALLINT NOT NULL CHECK (rating IN (1, -1)),
  created_at       TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (song_id, user_fingerprint)
);
