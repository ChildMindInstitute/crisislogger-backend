import queue from 'async/queue';
import axios from 'axios';

export default queue( async (task, callback) => {
  const result = await task();
  // Quick solution for demonstration
  axios({
      method: 'post',
      url: result.webhook_url,
      headers: {
        'Content-Type': 'application/json',
      },
      data: result,
    })
    .then((response) => {
      console.log('RES', response)
    })
    .catch((error) => {
      console.log('ERROR', error)
    });
}, 1);