export  default  function sleep(duartion=200) {
    return new Promise((resolve) => {
        setTimeout(resolve,duartion);
    })
}
