# dual-ephemeral [![Build Status](https://travis-ci.org/plediii/dual-ephemeral.svg)](https://travis-ci.org/plediii/dual-ephemeral)

Extend [dualapi](https://github.com/plediii/dualapi) domains with ephemeral nodes.  

Any [dual-protocol](https://github.com/plediii/dual-protocol) domain (including [dualapi](https://github.com/plediii/dualapi)), can be extended with dual-broadcast.

```javascript
var dual = require('dual-protocol').use(require('dual-ephemeral'));
```

Domains with this extension can add ephemeral hosts:
```javascript
var domain = dual();
domain.ephemeral(['e']);
```

Ephemeral groups broadcast *enter* and *exit* events.

```javascript
  domain.mount(['group', yyyy, 'enter'], function (body, ctxt) {
    console.log('New group member in ', yyyy, ':', ctxt.options.nodeRoute);
    console.log('Payload: ', body);
  });

  domain.mount(['group', yyyy, 'exit'], function (body, ctxt) {
    console.log('Group member in ', yyyy, ' exited:', ctxt.options.nodeRoute);
    console.log('Payload: ', body);
  });

```

After registering a client, 
```javascript
  domain.send(['e', 'register', 'client', xxxx]);
```
the client may be added to ephemeral groups: 
```javascript
   domain.send(['e', 'enter', 'client', xxxx], ['group', yyyy], { some: 'data' });
```

The client may exit manually, or disconnect:
```javascript
   domain.send(['e', 'exit', 'client', xxxx], ['group', yyyy]);
   domain.send(['disconnect', 'client', xxxx]);
```

Whichever happens first, ephemeral controller will emit an exit event
with the original enter payload.







