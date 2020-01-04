
module.exports = function(RED) {
    function trigger(config) {
        RED.nodes.createNode(this, config);
        var node = this;
        this.creds = RED.nodes.getNode(config.creds);
        node.on('input', function(msg) {
          node.send(msg);
        });
  }


 RED.nodes.registerType("zapier_trigger",trigger);


}
