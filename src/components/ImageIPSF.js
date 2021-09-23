import React, {useEffect, useState} from 'react';
import axios from "axios";

const gateway = "https://ipfs.io/ipfs/";

const ImageIpsf = (props) => {

  const {uri, size} = props;
  const [url, setUrl] = useState(null);

  useEffect(() => {
    getData();
  }, [uri]);

  const getData = () => {
    const dataUri = uri.split("://");
    if (dataUri && dataUri[0] === "ipfs") {
      const urlMetadata = `${gateway}${dataUri[1]}`;
      console.log({urlMetadata});
      axios.get(urlMetadata).then((metadata) => {
        if (metadata && metadata.data && metadata.data.image) {
          const {image} = metadata.data;
          const dataImage = image.split("://");
          if (dataImage && dataImage[0] === "ipfs") {
            const imageUrl = `${gateway}${dataImage[1]}`;
            setUrl(imageUrl);
          }
        }
        console.log({metadata});
      }).catch((error) => {
        console.error(error);
      });

    }
  }

  return (
    <div>
      {url ? <img src={url} style={{height:size}}/> : null}
    </div>
  );
};

export default ImageIpsf;
