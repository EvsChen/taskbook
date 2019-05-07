const axios = require('axios');
// TODO: Manually access the token
const accessToken = 'b57957550eeb35eaaae80ded2667a24740c884f4162cbd7b3042036f37c5';
const clientId = '1e2052f0e7a2dbb9625b';
const headers = {
  'X-Access-Token': accessToken,
  'X-Client-ID': clientId
};

const client = axios.create({
  headers,
  baseURL: 'https://a.wunderlist.com/api/v1/'
});

const create = info => client.post('/tasks', info);

const update = (id, info) => client.patch(`/tasks/${id}`, info);

module.exports = {
  client,
  create,
  update
};
