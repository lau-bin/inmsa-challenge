import { Inject, Injectable, Logger } from '@nestjs/common';
import { EntityManager } from '@mikro-orm/sqlite';
import { User } from '../domain/entities/userEntity';
import { incorrectPassword, invalidPassword, nameTaken, userDoesNotExist, PasswordHashingException, PropertyStorageException, propertyDoesNotExist, DownloadPropertyException } from './errors';
import { GetObjectCommand, ListObjectsV2Command, PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { PropertyEntity } from 'src/domain/entities/propertyEntity';
import { ConfigService } from '@nestjs/config';
import { EnvironmentVariables } from 'src/config/envVars';
import { Readable } from 'node:stream';


@Injectable()
export class PropertyManager {
  private readonly log = new Logger(PropertyManager.name);
  private client;
  constructor(
    private readonly em: EntityManager,
    private config: ConfigService<EnvironmentVariables, true>

  ) {
    this.client = new S3Client({});
  }
  public async storeProperty(name: string, imagesBase64: string[], description: string) {
    let property = await this.em.findOne(PropertyEntity, { name: name });
    if (property === null) {
      property = new PropertyEntity();
    } else {
      return nameTaken;
    }
    property.name = name;
    property.description = description;
    await this.em.persist(property).flush();

    // if there is an error in this stage, the client will have to delete the entity 
    for (let i = 0; i < imagesBase64.length; i++) {
      // store each element with the same prefix to allow search by prefix
      this.uploadPropertyData(property.id.toFixed(0) + "/" + i, imagesBase64[i])
    }
  }
  private async uploadPropertyData(id: string, imageBase64: string) {
    const bae64Data = imageBase64.replace(/^data:([A-Za-z-+/]+);base64,/, '');
    const command = new PutObjectCommand({
      Bucket: this.config.get("PROPERTY_BUCKET_NAME"),
      Key: id,
      Body: Buffer.from(bae64Data, 'base64'),
      ContentEncoding: "base64",
      ContentType: "application/octet-stream"
    });
    try {
      await this.client.send(command);
    } catch (err) {
      this.log.error("Error storing property", err);
      throw new PropertyStorageException(err);
    }
  }

  async getProperties(id: number) {
    let property = await this.em.findOne(PropertyEntity, { id });
    if (property === null) {
      return propertyDoesNotExist;
    }
    const params = {
      Bucket: this.config.get("PROPERTY_BUCKET_NAME"),
      Prefix: id.toFixed(0) + "/"
    };
    let images: string[] = [];
    try {
      const command = new ListObjectsV2Command(params);
      const data = await this.client.send(command);

      if (data.Contents) {
        for (const content of data.Contents) {
          images.push(await this.downloadProperty(content.Key!));
        }
      }else{
        this.log.error("Error listing properties, no content");
        throw new DownloadPropertyException("No content");
      }
    } catch (err) {
      this.log.error("Error listing properties", err);
      throw new DownloadPropertyException(err);
    }
    return {
      property,
      images
    }
  }

  private async downloadProperty(key: string) {
    const params = {
      Bucket: this.config.get("PROPERTY_BUCKET_NAME"),
      Key: key
    };

    try {
      const command = new GetObjectCommand(params);
      const data = await this.client.send(command);

      if (!data.Body || !(data.Body instanceof Readable)){
        throw new DownloadPropertyException("No data");
      }
      // read the data from the stream
      const chunks: Uint8Array[] = [];
      for await (const chunk of data.Body as AsyncIterable<Uint8Array>) {
        chunks.push(chunk);
      }
      const binaryData = Buffer.concat(chunks);
      const base64String = binaryData.toString('base64');
      return base64String;
    }catch (err){
      this.log.error("Error downloading property", err);
      throw new DownloadPropertyException(err);
    }
  }
}
