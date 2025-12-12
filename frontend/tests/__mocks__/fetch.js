global.fetch = jest.fn((url, options) => {
  return Promise.resolve({
    ok: true,
    status: 200,
    text: jest.fn(() => Promise.resolve('{}')),
    json: jest.fn(() => Promise.resolve({}))
  });
});

module.exports = global.fetch;

