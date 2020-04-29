import fetch from './fetch';

const loadQiniu = ( ()=> {
    let qiniu: any = null;
    return async  function handleLoadQiniu() {
        if(qiniu) {
            return qiniu;
        }
        // @ts-ignore
        qiniu = await  import(/* webpackChunkName: "qiniu" */ 'qiniu-js');
        return qiniu;
    }
})();


interface QiniuUploadInfo {
    key: string;
}

export default async function uploadFile(
    blob: Blob,
    qiniuKey: string,
    fileName: string,
    qiniuNextEventCallback?: (info: QiniuUploadInfo) => void,
): Promise<string> {
    // 获取七牛上传token
    const [getTokenErr, tokenRes] = await fetch('uploadToken');
    if (getTokenErr) {
        throw Error(getTokenErr);
    }

    // 服务端返回标识, 说明七牛不可用, 则上传文件到服务端
    if (tokenRes.useUploadFile === true) {
        const [uploadErr, result] = await fetch('uploadFile', {
            file: blob,
            fileName,
        });
        if (uploadErr) {
            throw Error(uploadErr);
        }
        if (qiniuNextEventCallback) {
            qiniuNextEventCallback({
                // @ts-ignore
                total: {
                    percent: 100,
                },
            });
        }
        return result.url;
    }

    // 七牛可用, 上传到七牛
    const qiniu = await loadQiniu();
    return new Promise((resolve, reject) => {
        const result = qiniu.upload(blob, qiniuKey, tokenRes.token, { useCdnDomain: true }, {});
        result.subscribe({
            next: (info:QiniuUploadInfo) => {
                if (qiniuNextEventCallback) {
                    qiniuNextEventCallback(info);
                }
            },
            error: (qiniuErr: Error) => {
                reject(qiniuErr);
            },
            complete: async (info: QiniuUploadInfo) => {
                const imageUrl = `${tokenRes.urlPrefix + info.key}`;
                resolve(imageUrl);
            },
        });
    });
}
