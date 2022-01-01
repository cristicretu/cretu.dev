import React from 'react';

interface DownloadImageProps {
  src: string;
  title: string;
}

export const DownloadImage: React.FC<DownloadImageProps> = ({ src, title }) => {
  const download = (e) => {
    fetch(e.target.href, {
      method: 'GET',
      headers: {}
    })
      .then((response) => {
        response.arrayBuffer().then((buffer) => {
          const url = window.URL.createObjectURL(new Blob([buffer]));
          const link = document.createElement('a');
          link.href = url;
          link.setAttribute('download', `${title}.png`);
          document.body.appendChild(link);
          link.click();
          link.remove();
        });
      })
      .catch((err) => {
        console.log(err);
      });
  };

  return (
    <a href={src} download={title}>
      Download {title} (5120 x 2880px).
    </a>
  );
};
