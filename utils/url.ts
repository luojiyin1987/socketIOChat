interface   UrlParms {
    [key: string]: string;
}

export function addParam(url: string, params: UrlParms){
    let result = url;
    Object.keys(params).forEach((key) => {
        if(result.indexOf('?') === -1) {
            result += `?${key}=${params[key]}`;
        } else {
            result += `&${key}=${params[key]}`;
        }
    });
    return result;
}
