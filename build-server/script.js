import * as fs from "fs"
import { exec } from "child_process"
import path from "path";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { generateSlug } from "random-word-slugs";
import { lookup } from "mime-types";

const s3Client = new S3Client({
    region: process.env.AWS_REGION,
    Credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
    }
});

async function init() {
    console.log("Building server...");
    const __dirname = path.resolve();
    console.log(__dirname);
    const outDirPath = path.join(__dirname, "output");
    const p = exec(`cd ${outDirPath} && npm install && npm run build`);
    const projectId = generateSlug(2);

    p.stdout.on("data", (data) => {
        console.log(data.toString());
    })

    p.stdout.on("error", (data) => {
        console.log(data.toString());
    })

    p.on("close", async () => {
        console.log("Build commplete !");
        const distDirPath = path.join(__dirname, "output", "dist");
        console.log("distDirPath", distDirPath);
        // const distPath = path.join(outDirPath, "dist");
        const distFolderContent = fs.readdirSync(distDirPath, { recursive: true });

        for (const file of distFolderContent) {
            const filePath = path.join(distDirPath, file);
            if (fs.lstatSync(filePath).isDirectory()) {
                continue;
            }
            console.log(`Uploading > ${file}`);

            // send files to s3 bucket
            const command = new PutObjectCommand({
                Bucket: process.env.AWS_BUCKET_NAME,
                Key: `__outputs/${projectId}/${file}`,
                Body: fs.createReadStream(filePath),
                ContentType: lookup(filePath)
            })

            await s3Client.send(command);
            console.log(`Uploaded > ${file}`)
        }



        // send dist folder content to s3 bucket

    })
}

init();