module.exports = function(RED) {
 RED.nodes.registerType("zapierconf",zapierconf,{
   credentials: {
     baseurl : {type:"text"},
     token: {type:"text"}
   }
 });
}
