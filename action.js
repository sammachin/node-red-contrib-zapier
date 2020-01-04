
module.exports = function(RED) {
    function action(config) {
      RED.nodes.eachNode(function(node) {
        console.log(node);
      });
      RED.nodes.createNode(this, config);
      var node = this;
      this.creds = RED.nodes.getNode(config.creds);
      node.on('input', function(msg) {
        node.send(msg);
      });
  }

 RED.nodes.registerType("zapier_action",action);
}
