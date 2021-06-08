const fs = require('fs');
const aws = require('aws-sdk');

const {
  access_Key_Id, secret_Access_Key, region, s3_bucket,
} = require('../config/environment');

exports.uploadImage = (file, key, callback) => {
  aws.config.setPromisesDependency();
  aws.config.update({
    accessKeyId: access_Key_Id,
    secretAccessKey: secret_Access_Key,
    region,
  });
  const s3 = new aws.S3();

  const params = {
    Bucket: s3_bucket,
    Body: fs.createReadStream(file),
    Key: key,
  };

  s3.upload(params, (err, data) => {
    if (err) {
      console.log('Error occured while trying to upload to S3 bucket', err);
      return err;
    }

    if (data) {
      fs.unlinkSync(file);
      const imageURL = data.Location;
      callback(imageURL);
      return data;
    }
    return data;
  });
};
