import { UploadNetMethod } from "..";
import type { UploadAttributes } from "../utils/uploadDataType";

interface RequestOptions {
  onBeforeUpload?: () => void;
  onProgress?: (totalSize: number, currentSize: number) => void;
  done?: (data: any) => void;
  onError?: (err: any) => void;
}

export default function (
  url: string,
  method: UploadNetMethod,
  data: UploadAttributes[],
  totalSize: number,
  options?: RequestOptions
) {
  let requestArray: Promise<any>[] = [];
  let current = 0;

  // 上传之前的回调函数

  options && options.onBeforeUpload && options.onBeforeUpload();

  // 构建xhr请求数组
  for (let i = 0; i < data.length; i++) {
    const item = new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      // xhr.setRequestHeader("Content-Type", "application/json");
      xhr.upload.addEventListener("progress", (event) => {
        current += event.loaded;
        options && options.onProgress && options.onProgress(totalSize, current);
      });

      xhr.upload.addEventListener("loadend", (event) => {
        resolve(event);
      });

      xhr.upload.addEventListener("error", (err) => {
        reject(err);
      });

      xhr.open(method, url, true);

      // const formData = new FormData();

      // formData.append("upload", data[i] as any);

      // console.log(data[i]);

      xhr.send(JSON.stringify(data[i]));
    });

    requestArray.push(item);
  }

  Promise.all(requestArray)
    .then((resp) => {
      // 上传完成
      options && options.done && options.done(resp);
    })
    .catch((err) => {
      // 上传失败
      options && options.onError && options.onError(err);
    });
}
