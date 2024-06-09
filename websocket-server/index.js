import { WebSocket, WebSocketServer } from "ws";
import express from "express";
import { createClient } from "redis";
import url from "url";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const port = 8080;
const server = app.listen(port, () => {
    console.log(`Web Socket Server started on port ${port}`);
});

const subscriber = createClient({
    url: process.env.REDIS_URL
});



const wss = new WebSocketServer({ server });

wss.on("connection", (ws, req) => {
    console.log("Client connected");

    const query = url.parse(req.url, true).query;
    const channel = query.channel;
    if (!channel) {
        ws.send("Channel is required");
        ws.close();
        return;
    }
    console.log(channel);

    ws.on('error', (error) => {
        console.log(`Received error => ${error}`);
    });



    const subescribeAndSend = async (channel) => {
        try {
            if (!subscriber.isOpen) {
                await subscriber.connect();
                console.log("Subscriber connected to Redis");
            }
            subscriber.subscribe(channel, (message) => {
                console.log(`Received message on channel ${channel} => ${message}`);
                ws.send(message.toString());

            });

        } catch (e) {
            console.log(`Error subscribing to channel ${channel}`);
            console.log(e);
            ws.send(`Error subscribing to channel ${channel}`);
        }

    }

    subescribeAndSend(channel);

    ws.on('message', (message) => {
        try {
            console.log(`Received message => ${message}`);
            wss.clients.forEach((client) => {
                if (client.readyState === WebSocket.OPEN) {
                    client.send(message.toString());
                }
            });
        } catch (error) {
            console.log(`Error sending message => ${error}`);
        }

    });

    ws.on('close', () => {
        try {
            subscriber.unsubscribe(channel);
            console.log("Client disconnected");
        } catch (error) {

        }
    })

    ws.send("Connected to the WebSocket server");
})

