require('@tensorflow/tfjs-core');
require('@tensorflow/tfjs-converter');
require('@tensorflow/tfjs-backend-cpu');
require('@tensorflow/tfjs-backend-webgl');

const cocoSsd = require('@tensorflow-models/coco-ssd')
let model = null;

export default function getObjectDetector() {
    return new Promise((resolve) => {
        if (model !== null) {
            resolve(model);
        } else {
            cocoSsd.load().then(m => {
                model = m;
                resolve(model)
            });
        }
    });
}