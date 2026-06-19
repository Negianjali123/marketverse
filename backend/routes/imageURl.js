import express from "express";
import { GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { s3 } from "../config/s3.js";

const router = express.Router();

router.post("/view", async (req, res) => {
  try {
    const images = req.body;
    // console.log(images); debugger;

      async function getUrlImages(Keys) {
        const urlsMap = new Map();
        // const urls = [];
        for (const keys of key) {
          const command = new GetObjectCommand({
            Bucket: process.env.AWS_BUCKET_NAME,
            Key: key,
          });

          const signedUrl = await getSignedUrl(s3, command, {
            expiresIn: 300, // 5 minutes
          });
          // console.log(signedUrl)
          urlsMap.set(key, signedUrl);

        }
        return urlsMap;


      }
    getUrlImages(images);


    // const imageUrls = await Promise.all(
    //   images.map(async (imageName) => {
    //     const command = new GetObjectCommand({
    //       Bucket: process.env.AWS_BUCKET_NAME,
    //       Key: imageName,
    //     });

    //     const imageUrl = await getSignedUrl(s3, command, {
    //       expiresIn: 300,
    //     });

    //     return {
    //       imageName,
    //       imageUrl,
    //     };
    //   })
    // );

    res.json({
      imageUrl: imageUrls,
    });
  } catch (error) {
    console.error("S3 view error:", error);
    res.status(500).json({
      message: "Failed to generate image URL",
    });
  }
});

export default router;