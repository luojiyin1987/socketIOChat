import xss from 'xss';

const myXss = new xss.FilterXSS({
    whiteList:{},
});


/**
 *
 * @param text
 */
export default  function processXss(text: string) {
    return myXss.process(text);
}
