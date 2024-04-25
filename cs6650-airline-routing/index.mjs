import axios from 'axios';
import { routes, port } from './constants.mjs';

export const handler = async (event) => {
  const path = event.path;
  const method = event.httpMethod;
  const headers = event.headers;
  const target = routes[headers['airline-name']];
  const reqBody = event.body;
  
  if (!target) {
    return {
      statusCode: 401,
      headers: {
        'Access-Control-Allow-Origin': '*',
      },
      body: JSON.stringify({
        msg: 'Missing airline name'
      }),
    };
  }
  
  try {
    let res;
    
    switch (method) {
      case 'POST':
        res = await axios.post(
          `http://${target}:${port}${path}`,
          reqBody,
          {
            headers,
          },
        );
        break;
      case 'PUT':
        res = await axios.put(
          `http://${target}:${port}${path}`,
          reqBody,
          {
            headers,
          },
        );
        break;
      default:
        return {
          statusCode: 401,
          headers: {
            'Access-Control-Allow-Origin': '*',
          },
          body: JSON.stringify({
            msg: 'Invalid request method'
          }),
        };
    }
    
    return {
      statusCode: 200,
      headers: res.headers,
      body: JSON.stringify(res.data),
    };
  } catch (err) {
    let errMsg = err.message;
    
    if (!headers['cognito-token']) {
      errMsg += '\n(Access Token: not found)';
    }
    
    return {
      statusCode: 500,
      headers: {
        'Access-Control-Allow-Origin': '*',
      },
      body: JSON.stringify({
        msg: 'Server error',
        err: errMsg,
      }),
    };
  }
};
