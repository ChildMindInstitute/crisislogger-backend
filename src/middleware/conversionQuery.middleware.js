import queue from 'async/queue';
import axios from 'axios';

export default (req, res, next) => {
  req.asyncQuery = queue( async (task, callback) => {
    const result = await task();

    axios.post(result.webhook_url, result, {
        headers: {
            'Content-Type': 'application/json',
        }
    })
    .then((response) => {
      console.log(response.data);
    }, (error) => {
      console.log(error);
    });
  }, 1);
  next();
}