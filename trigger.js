
var request = require('request');
var clone = require("clone"); //only required for workaroun

module.exports = function(RED) {
  function trigger(n) {
        RED.nodes.createNode(this, n);
        var node = this;
        this.name = n.name
        let o ={}
        o.name = this.name 
        o.id = this.id
        trigger_nodes.push(o)
        this.token = RED.nodes.getNode(n.conf).token
        node.on('input', function(msg) {
          if (!trigger_webhooks[this.id]){
            node.error("Webhook Not Defined, check there is an active Zap for this trigger")
          }
          let url = trigger_webhooks[this.id]
          this.last_msg = {
            id: msg._msgid,
            topic : msg.topic,
            payload : msg.payload
          }
          request.post({url:url, json: true, body: this.last_msg}, function(err, response, body) {
            if (err) { 
              node.error(err);
            }
            if (response.statusCode != 200){
              node.error(response.statusCode+': '+response.statusMessage)
              console.log(body)
            }
          })
        })
        this.on("close", function(removed, done) {
          var node = this;
          trigger_nodes.map(function(x, i){
            if (x.id == node.id){
              trigger_nodes.splice(i, 1)
            }
          }) 
          if (removed){          
            delete trigger_webhooks[node.id]
            if (Object.keys(trigger_webhooks).length == 0){
              RED.settings.delete('zapierTriggerWebhooks')
            } else {
              RED.settings.set('zapierTriggerWebhooks', trigger_webhooks)
            }
          }
          done()
        })
  }
  RED.nodes.registerType("zapier_trigger",trigger);

  RED.httpNode.post('/_zapier/triggers/:id', function(req, res){ 
    let target_node = RED.nodes.getNode(req.params.id)
    if (target_node){
      if (target_node.token == req.headers['x-token']){
        trigger_webhooks[req.params.id] = req.body.webhook
        //let r = RED.settings.set('zapierTriggerWebhooks', trigger_webhooks)
        //Workaround for bug in settings.js, fixed in https://github.com/node-red/node-red/pull/2584
        let new_hooks = clone(trigger_webhooks)
        let r = RED.settings.set('zapierTriggerWebhooks', new_hooks)
        //end workaround
        r.then(function(v) {
          res.send({status: 'ok'});
        })
      } else {
        res.sendStatus(403);
      }
    } else {
      res.sendStatus(404);      
    }
  })

  RED.httpNode.delete('/_zapier/triggers/:id', function(req, res){ 
    let target_node = RED.nodes.getNode(req.params.id)
    if (target_node){
      if (target_node.token == req.headers['x-token']){
        delete trigger_webhooks[req.params.id]
        if (Object.keys(trigger_webhooks).length == 0){
          RED.settings.delete('zapierTriggerWebhooks')
        } else {
          //let r = RED.settings.set('zapierTriggerWebhooks', trigger_webhooks)
          //Workaround for bug in settings.js, fixed in https://github.com/node-red/node-red/pull/2584
          let new_hooks = clone(trigger_webhooks)
          let r = RED.settings.set('zapierTriggerWebhooks', new_hooks)
          //end workaround 
        }
        res.sendStatus(204);
      } else {
        res.sendStatus(403);
      }
    } else {
      res.sendStatus(404);      
    }
  })

  RED.httpNode.get('/_zapier/triggers/:id', function(req, res){ 
    let target_node = RED.nodes.getNode(req.params.id)
    if (target_node){
      if (target_node.token == req.headers['x-token']){
        const sample = {
          "payload": "This is a Sample as no message has been recieved by the node yet",
          "id" : "11111111.aaaaaa",
          "topic" : "Sample"
        }
        let response = target_node.last_msg || sample
        res.send([response])
      } else {
        res.sendStatus(403);
      }
    } else {
      res.sendStatus(404);      
    }
  })

  RED.httpNode.get('/_zapier/triggers', function(req, res){
    var tokens = []
    for (x in trigger_nodes){
      let nid = trigger_nodes[x]['id']
      tokens.push(RED.nodes.getNode(nid).token)
    }
    if (tokens.indexOf(req.headers['x-token']) > -1) {
      res.json({triggers: trigger_nodes});
    } else{
      res.sendStatus(403);
    }
  })


  var trigger_nodes = []; 
  var trigger_webhooks= RED.settings.get('zapierTriggerWebhooks') || {}

  

}
