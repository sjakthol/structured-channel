A wrapper around [MessageChannel](https://developer.mozilla.org/en-US/docs/Web/API/MessageChannel) API for bi-directional communication between two browsing contexts.

## Usage
The bundles in the `dist/` directory are in [UMD format](https://github.com/umdjs/umd) which allows them to be included as CommonJS and AMD modules or directly in a `<script>` tag.

## Simple example
Here's an example of Window - Worker communication using a StructuredChannel.

```javascript
// In worker.js
self.importScripts("structured-channel.js");
StructuredChannel.waitForConnection(this).then(function(channel) {
  channel.on("sum", function(data) {
    return data.a + data.b;
  });
});

// In main.js with structured-channel.js included via script tag.
var worker = new Worker("worker.js");
StructuredChannel.connectTo(worker).then(function(channel) {
  channel.send("sum", { a: 1, b: 2 }).then(function(reply) {
    // reply == 3
  });
});
```

## API
### Initialization
A new `StructuredChannel` is initialized by calling the static methods `connectTo()` and `waitForConnection()` on the different sides of the channel.

<a name="module_structured-channel..StructuredChannel.connectTo"></a>
#### StructuredChannel.connectTo(target, [targetOrigin], [global]) ⇒ `Promise`
Opens a StructuredChannel to the given target. The target must load this script and call `StructuredChannel.waitForConnection()`.

**Returns**: `Promise` - A Promise that is fulfilled with a `StructuredChannel` instance once the connection has been established. The promise is rejected on error.

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| target | `Window` &#124; `Worker` |  | The target window or a worker to connect to. |
| [targetOrigin] | `String` | `*` | If the target is a Window, this is the `targetOrigin` for [Window.postMessage()](https://developer.mozilla.org/en-US/docs/Web/API/Window/postMessage). __Failing to provide this parameter might have security implications as the channel could be opened to a malicious target.__ If the target is a Worker, this parameter is ignored. |
| [global] | `Object` |  | An optional global object that can be used to get a reference to the MessageChannel constructor. |

<a name="module_structured-channel..StructuredChannel.waitForConnection"></a>
#### StructuredChannel.waitForConnection([target], [origin]) ⇒ `Promise`
Waits for a connection request from `StructuredChannel.connectTo()` to arrive as a message event to the given target.

**Returns**: `Promise` - that is resolved with a `StructuredChannel` instance once the connection request is received. 

| Param | Type | Description |
| --- | --- | --- |
| [target] | `Window` &#124; `Worker` | The target that should receive the connection attempt (default `self`). |
| [origin] | `String` | The origin from which the connection attempt should come from. If undefined or '*', connection attempts and messages from all origins are allowed. __Failing to provide a specific origin might have security implications as malicious parties could establish a connection to this target.__ |

### Instance methods
You can attach handlers to messages by calling `StructuredChannel.on()` and send messages with `StructuredChannel.send()`.

<a name="module_structured-channel..StructuredChannel+send"></a>
#### StructuredChannel.send(type, payload) ⇒ `Promise`
Sends a message to the other side of the channel.

**Returns**: `Promise` - A Promise that is resolved once the receiver has handled the message. The resolution value will be the object the handler method returned. If the other party fails to handle the message, the promise is rejected.

| Param | Type | Description |
| --- | --- | --- |
| type | `String` | The type of the message. |
| payload | `Object` | The payload for the message. The value must support structured cloning. |

<a name="module_structured-channel..StructuredChannel+on"></a>
#### StructuredChannel.on(type, handler)
Adds a handler for given message type.

| Param | Type | Description |
| --- | --- | --- |
| type | `String` | The type of the message to handle. |
| handler | `function` | The handler function. The return value will be transferred back to the sender and the Promise returned by send() is settled according to it. If the function throws, returns a Promise that is eventually rejected or returns a value that cannot be transmitted to the sender, the send() Promise rejects. If the function returns a value, the send() Promise is fulfilled with that value. If the function returns a Promise that is eventually fulfilled, the send() Promise is fulfilled with the fulfillment value. |

<a name="module_structured-channel..StructuredChannel+off"></a>
#### StructuredChannel.off(type)
Removes the handler for the message of given type.

| Param | Type | Description |
| --- | --- | --- |
| type | `String` | The type of the message for which the handler is to be removed. |