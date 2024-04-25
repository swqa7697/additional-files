import axios from 'axios';
import { routes, port } from './constants.mjs';

export const handler = async (event) => {
  const path = event.path;
  const params = event.queryStringParameters;
  const headers = event.headers;
  
  let aggregatedData = [];
  let resHeaders = null;
  let errMsg = '';
  
  try {
    const numAirlines = Object.keys(routes).length;
    let failedRequests = 0;
    
    for (const airline in routes) {
      try {
        const res = await axios.get(
          `http://${routes[airline]}:${port}${path}`,
          {
            params,
            headers,
          },
        );
        
        aggregatedData.push(res.data);
        
        if (!resHeaders) {
          resHeaders = res.headers;
        }
      } catch (err) {
        errMsg = errMsg + err.message + '\n';
        failedRequests += 1;
      }
    }
    
    if (failedRequests === numAirlines) {
      throw new Error('All requests are failed');
    }
    
    return {
      statusCode: 200,
      headers: resHeaders,
      body: JSON.stringify(aggregatedData.flat()),
    };
  } catch (err) {
    errMsg += err.message;
    
    if (!headers['cognito-token']) {
      errMsg += '\n(Access Token: not found)';
    }
    
    return {
      statusCode: 500,
      headers: resHeaders ? resHeaders : {
        'Access-Control-Allow-Origin': '*',
      },
      body: JSON.stringify({
        msg: 'Server error',
        err: errMsg,
      }),
    };
  }
};
