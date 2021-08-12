<template>
  <b-container fluid>
    <b-overlay :show=true no-center opacity="0" class="video-viewport">
      <b-overlay :show=true opacity="0">
        <template #overlay>
          <canvas class="video-overlay video-viewport" ref="video-overlay"/>
        </template>
        <video class="video-viewport" ref="video-content" muted autoplay/>
      </b-overlay>
      <template #overlay>
        <b-container>
          <b-row align-v="end">
            <b-button v-on:click="toggleDetection">{{ nextAction }}</b-button>
          </b-row>
        </b-container>
      </template>
    </b-overlay>
  </b-container>
</template>

<script>

import getObjectDetector from "@/api/objdet.js"

export default {
  name: 'Camera',
  data: function () {
    return {
      nextAction: "Start"
    };
  },
  props: {
    msg: String
  },

  mounted: function () {
    let canvas = this.$refs["video-overlay"];
    let ctx = canvas.getContext('2d');
    ctx.lineWidth = 2;
    ctx.strokeStyle = 'yellow';
    ctx.fillStyle = 'white';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    console.log(canvas.width + ", " + canvas.height);
    ctx.strokeRect(17, 203, 534, 279);
  },

  methods: {
    takePhoto: function (delay) {
      let mediaStream = this.$refs["video-content"].srcObject;
      let imageCapture = new ImageCapture(mediaStream.getVideoTracks()[0]);
      getObjectDetector().then(detector => {
        imageCapture.takePhoto().then(
            image => {
              createImageBitmap(image)
                  .then(bitmap => {
                    detector.detect(bitmap).then(
                        predictions => {
                          let canvas = this.$refs["video-overlay"];
                          canvas.width = 640;
                          canvas.height = 480;
                          let ctx = canvas.getContext('2d');
                          ctx.lineWidth = 2;
                          ctx.strokeStyle = 'yellow';
                          ctx.fillStyle = 'white';
                          ctx.clearRect(0, 0, canvas.width, canvas.height);
                          console.log("object detected: " + predictions.length)
                          predictions.forEach(predicted => {
//                            if (predicted.class === "car") {
                              ctx.strokeRect(predicted.bbox[0], predicted.bbox[1],
                                  predicted.bbox[2], predicted.bbox[3]);
//                            }
                          });
                        })
                  })
            }).then(() => {
          if (this.nextAction === "Stop") {
            setTimeout(() => {
              this.takePhoto(delay)
            }, delay);
          }
        })
      })
    },
    toggleDetection: function () {
      if (this.nextAction === "Start") {
        navigator.mediaDevices.getUserMedia({video: true})
            .then(mediaStream => {
              this.$refs["video-content"].srcObject = mediaStream;
            }).then(() => {
          this.takePhoto(300);
          this.nextAction = "Stop";
        });
      } else if (this.nextAction === "Stop") {
        this.nextAction = "Done";
        this.$refs["video-content"].srcObject.getVideoTracks().forEach(track => {
          track.stop();
        });
      }
    }
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>

.video-viewport {
  width: 640px;
  height: 480px;
}

</style>
