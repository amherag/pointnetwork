/* Instructions:

Start up all Point Network nodes
Run this file at the terminal `node tests/sockets/client_test.js`
You should see output like so:

{"data":{"ping":"pong"}}

Now run a deployment. You should see the stream update as the files are deployed!
*/
const WebSocket = require('ws');

const ws = new WebSocket('ws://localhost:2469/ws/deploy/progress');

const path = require('path')

deploy_example='example/hello.z'

ws.on('open', () => {
  // ws.send('status');
  ws.send('ping');
  // uncomment the below 'deploy' command and the node will deploy the example site!
  // ws.send(`deploy?deploy_path=${path.resolve(deploy_example)}`);
});

ws.on('message', (data) => {
  console.log(data);
});
