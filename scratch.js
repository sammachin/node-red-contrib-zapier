
var globalSettings = {"zapierTriggerWebhooks": {
    "1.1": "https://example.com/1",
    "2.2": "https://example.com/2"
   }
}

function test(prop, value){
    var current = globalSettings[prop];
    globalSettings[prop] = value;
    try {
        assert.deepEqual(current,value);
        return when.resolve();
    } catch(err) {
        console.log('save')
        //return storage.saveSettings(globalSettings);
    }
}



var p = "zapierTriggerWebhooks"
var v = {
    "1.1": "https://example.com/1111",
    "2.2": "https://example.com/2222"
   }


test(p ,v)