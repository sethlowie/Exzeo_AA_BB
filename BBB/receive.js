var amqp = require('amqplib/callback_api');

function createConn(){

  amqp.connect('amqp://rabbitmq', function(err, conn) {

    if (err){
      console.log(err)
      return;
    }

    clearTimeout(timer);

    conn.createChannel(function(err, ch) {

      var ex = 'LOG';
      var key = 'info.email.*';

      ch.assertExchange(ex, 'topic', {durable: true});

      ch.assertQueue('', {exclusive: true}, function(err, q) {

        console.log(' [*] Waiting for logs. To exit press CTRL+C');

        ch.bindQueue(q.queue, ex, key);

        ch.consume(q.queue, function(msg) {

          var message = JSON.parse(msg.content).message;
          console.log(" [x] %s:'%s'", msg.fields.routingKey, JSON.stringify(message));
          ch.ack(msg);

        }, {noAck: false});

      });

    });

  });
}

var timer = setTimeout(createConn, 500);
