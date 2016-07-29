const amqp = require('amqplib/callback_api');
const express = require('express');

const PORT = 8181;
const app = express();

app.get('/', function (req, res) {
    amqp.connect('amqp://rabbitmq', function(err, conn) {

      if (err){
        console.log(err);
        return;
      }

      conn.createChannel(function(err, ch) {

        if (err){
          console.log(err);
          return res.send(err);
        }

        var ex = 'LOG';

        var key = 'info.email.sending';

        var payload = JSON.stringify({
          'timestamp': new Date().now,
          'title': 'Email was sent',
          'message': {
            to: 'someone@somewhere.com',
            from: 'someoneelse@somewhereelse.com',
            subject: 'blahblah',
            body: 'blahblahblah',
            status: 'OK'
          },
          'hostname': 'email.somewhere.com',
          'level': 'info',
          'json': true
        });

        ch.assertExchange(ex, 'topic', {durable: true});

        ch.publish(ex, key, new Buffer(payload));

        console.log(" [x] Sent %s:'%s'", key, payload);

        res.send('published message\n');
      });

    });

});

app.listen(PORT);
console.log('Running on http://localhost:' + PORT);
