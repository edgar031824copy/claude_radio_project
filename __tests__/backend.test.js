jest.mock('../src/models/ratingModel');
const { getRatings, insertRating, deleteRating } = require('../src/models/ratingModel');
const request = require('supertest');
const app = require('../src/app');

beforeEach(() => jest.clearAllMocks());

describe('GET /api/ratings', () => {
  it('400 without song param', async () => {
    const res = await request(app).get('/api/ratings');
    expect(res.status).toBe(400);
  });

  it('200 with valid song param', async () => {
    getRatings.mockResolvedValueOnce({ up: 2, down: 0, userVote: null });
    const res = await request(app).get('/api/ratings?song=artist::title');
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ up: 2, down: 0, userVote: null });
  });

  it('500 on db error', async () => {
    getRatings.mockRejectedValueOnce(new Error('db down'));
    const res = await request(app).get('/api/ratings?song=artist::title');
    expect(res.status).toBe(500);
  });
});

describe('POST /api/ratings', () => {
  it('400 without body', async () => {
    const res = await request(app).post('/api/ratings').send({});
    expect(res.status).toBe(400);
  });

  it('400 with invalid rating value', async () => {
    const res = await request(app).post('/api/ratings').send({ song_id: 'song1', rating: 99 });
    expect(res.status).toBe(400);
  });

  it('200 — inserts new vote', async () => {
    getRatings
      .mockResolvedValueOnce({ up: 0, down: 0, userVote: null })
      .mockResolvedValueOnce({ up: 1, down: 0, userVote: 1 });
    deleteRating.mockResolvedValue();
    insertRating.mockResolvedValue();

    const res = await request(app).post('/api/ratings').send({ song_id: 'song1', rating: 1 });
    expect(res.status).toBe(200);
    expect(res.body.up).toBe(1);
  });

  it('200 — toggles vote off when same rating clicked again', async () => {
    getRatings
      .mockResolvedValueOnce({ up: 1, down: 0, userVote: 1 })
      .mockResolvedValueOnce({ up: 0, down: 0, userVote: null });
    deleteRating.mockResolvedValue();

    const res = await request(app).post('/api/ratings').send({ song_id: 'song1', rating: 1 });
    expect(res.status).toBe(200);
    expect(insertRating).not.toHaveBeenCalled();
  });
});
