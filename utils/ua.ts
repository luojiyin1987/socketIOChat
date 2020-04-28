const UA = window.navigator.userAgent;

export const isiOS = /iPhone/i.test(UA);
export const isAndrood = /android/i.test(UA);
export const isMobile = isiOS || isAndroid;
