<h1 align="center">
Maker.js CDP Leverge Example
</h1>

If you'd like to get it running locally:

1.  From the root project directory, run
    `$ npm install`
2.  Start the webserver with
    `$ KOVAN_PRIVATE_KEY=<your_private_key> npm start`
3.  Visit `http://localhost:1337` with the following query params:

    1.  `iterations`
    2.  `priceFloor`
    3.  `principal`

(ex: run `curl http://localhost:1337/\?iterations=1\&priceFloor=400\&principal=0.1` on your command line)
