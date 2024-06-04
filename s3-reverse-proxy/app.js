import express from "express"
import httpProxy from "http-proxy";


const port = 8080

const app = express();

const proxy = httpProxy.createProxy();

const BASE_URL = 'https://akash-play-versel.s3.ap-south-1.amazonaws.com/__outputs';


app.use((req, res) => {
    const hostname = req.hostname;
    const subdomain = hostname.split('.')[0];
    const resolveTo = `${BASE_URL}/${subdomain}`;

    return proxy.web(req, res, {
        target: resolveTo,
        changeOrigin: true
    })
})

proxy.on('proxyReq', (proxyReq, req, res) => {

    const url = req.url;
    if (url === '/') {
        proxyReq.path += 'index.html';
    }
})


app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
})