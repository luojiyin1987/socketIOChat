import randomColor from 'randomcolor';

type ColorMode = 'dark' | 'bright' | 'light' | 'random';

export function getRandomColor(seed: string, luminosity: ColorMode = 'dark'){
    return randomColor({luminosity, seed,});
}

type Cache = {
    [key:string]: string;
};

const cache: Cache = {};

export function getPerRandomColor(seed: string, luminosity: ColorMode='dark') {
    if(cache[seed]){
        return cache[seed];
    }
    cache[seed] = randomColor({ luminosity });
    return  cache[seed];
}
