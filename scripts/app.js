const app = Vue.createApp({
  data() {
    return {
      playStatus: false,
      video: null,
      playbackRate: 1,
      sliderMax: 0,
      sliderValue: 0
    };
  },
  methods: {
    play() {
      this.playStatus = !this.playStatus;
      this.video = this.$refs.video;
      if(this.video) {
        this.video.play();  //trigger(this.playStatus?"pause":"play");
        this.sliderMax = this.video.duration;
        console.log("haydarrr" + this.sliderMax)
        this.playBar();
      }
    },
    playBar() {
      if(this.playStatus) {
          this.sliderValue = this.video.currentTime;
          setTimeout(()=> {this.playBar()},1000);         
      }      
    },
    setCurrentTime(evt) {
      this.video.currentTime = evt.target.value;
    }
  },
  computed: {
    formattedTime() {
      return (new Date(Math.floor(this.sliderValue) * 1000)).toUTCString().match(/(\d\d:\d\d:\d\d)/)[0];
    }
  },
  watch: {
    playbackRate(newValue, oldValue)  {
      console.log("playbackRate New => Old", oldValue, newValue);
      this.video.playbackRate = newValue || 1;
    },
  },
});

app.mount("#app");
