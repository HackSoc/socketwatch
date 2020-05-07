socketwatch
===

The use of the [URL](https://nodejs.org/api/url.html) API requires **nodejs version 10 or later**.

## Example usage
This is best put behind an Nginx reverse proxy, perhaps under a subpath

```html
There are <span id="viewers">0<span> people viewing this page right now.
<script>
    let ws = new WebSocket("ws://example.com/socketwatch/");

    ws.addEventListener('message', (viewcount) => {
        document.querySelector('#viewers').innerHTML = viewcount;
    }); // Whenever the server replies, update the view count

    ws.addEventListener('open', () => {
        setInterval(()=>{
            ws.send(window.location.href);
        }, 5000); // Every 5 seconds, send the server our URL.
    });
</script>

```