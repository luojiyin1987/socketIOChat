import {readFile} from "fs";

export interface ReadDiskResult {
    /** 文件名 */
    filename: string;
    /** 文件拓展名 */
    ext: string;
    /** 文件类型 */
    type: string;
    /** 文件内容 */
    result: Blob | ArrayBuffer | string;
    /** 文件长度 */
    length: number;
}

export default async function readDiskFile(resultType= 'blob', accept= '*/*') {
    const result:  ReadFileResult | null = await  new Promise((resolve)=> {
        const $input = document.createElement('input');
        $input.style.display = 'none';
        $input.setAttribute('type', 'file');
        $input.setAttribute('accept', accept);

        $input.onclick = () => {
            // @ts-ignore
            $input.value = null;
            document.body.onfocus = () => {
                setTimeout(()=> {
                    if($input.value.length === 0) {
                        resolve(null);
                    }
                    document.body.onfocus = null;
                }, 500);
            };
        };

        $input.onchange = (e: Event) => {
            // @ts-ignore
            const file = e.target.files[0];
            if(!file) {
                return;
            }

            const reader = new FileReader();
            reader.onloadend = function handleLoad() {
                resolve({
                    filename: file.name,
                    ext: file.name
                        .split('.')
                        .pop()
                        .toLowerCase(),
                    type: file.type,
                    result: this.result,
                    length:
                        resultType === 'blob'
                            ?(this.result as ArrayBuffer).byteLength
                            :(this.result as string).length,
                });
            };

            switch(resultType) {
                case 'blob': {
                    reader.readAsArrayBuffer(file);
                    break;
                }
                case 'base64': {
                    reader.readAsDataURL(file);
                    break;
                }
                default: {
                    reader.readAsArrayBuffer(file);
                }
            }
        };
        $input.click();
    });

    if(result && resultType === 'blob') {
        result.result = new Blob([new Uint8Array(result.result as ArrayBuffer)], {
            type: result.type,
        });
    }
    return result;
}
