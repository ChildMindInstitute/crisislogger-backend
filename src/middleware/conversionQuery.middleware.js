import queue from 'async/queue';
import axios from 'axios';

export default (req, res, next) => {
  req.asyncQuery = queue( async (task, callback) => {
    const result = await task();
    if (result)
    {
      axios.post(result.webhook_url, result, {
        headers: {
            'Content-Type': 'application/json',
        },
        maxContentLength: Infinity,
        maxBodyLength: Infinity
    })
    .then(response => {
      console.log('response')
    }).catch(error => {
      console.log('error')
    })
  }
  }, 1);
  next();
}