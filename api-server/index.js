import express from "express"
import { ECSClient, RunTaskCommand } from "@aws-sdk/client-ecs";
import dotenv from "dotenv";
import { generateSlug } from "random-word-slugs";

dotenv.config();

const config = {
    region: process.env.AWS_REGION,
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
    }
}

const ecsClient = new ECSClient(config);

const port = 8000

const app = express();


app.post('/project', async (req, res) => {
    const PROJECT_SLUG = req.body?.projectSlug;

    if (!PROJECT_SLUG) {
        PROJECT_SLUG = generateSlug(2);
    }

    const input = { // RunTaskRequest

        cluster: "builder-cluster",
        taskDefinition: "builder-task",
        launchType: "FARGATE",
        count: 1,
        networkConfiguration: {
            awsvpcConfiguration: {
                subnets: ["subnet-14a8296f", "subnet-7c9ce330", "subnet-1aa5ab72"],
                assignPublicIp: "ENABLED",
                securityGroups: ["sg-5505c032"],
            },

        },

        overrides: {
            containerOverrides: [
                {
                    name: "builder-image",
                    environment: [
                        {
                            name: "AWS_ACCESS_KEY_ID",
                            value: process.env.AWS_ACCESS_KEY_ID
                        },
                        {
                            name: "AWS_SECRET_ACCESS_KEY",
                            value: process.env.AWS_SECRET_ACCESS_KEY
                        },
                        {
                            name: "AWS_REGION",
                            value: process.env.AWS_REGION
                        },
                        {
                            name: "AWS_BUCKET_NAME",
                            value: process.env.AWS_BUCKET_NAME
                        },
                        {
                            name: "GIT_REPO_URL",
                            value: process.env.GIT_REPO_URL
                        },
                        {
                            name: "PROJECT_SLUG",
                            value: PROJECT_SLUG
                        }
                    ]
                }
            ]
        }


    }
    try {
        const command = new RunTaskCommand(input);
        await ecsClient.send(command);
        return res.json({ status: 'queued', data: { PROJECT_SLUG, url: `http://${PROJECT_SLUG}.localhost:8000` } });
    } catch (error) {
        console.error('Error running task:', error);
        return res.status(500).json({ error: 'Failed to queue the project' });
    }
})





app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
})