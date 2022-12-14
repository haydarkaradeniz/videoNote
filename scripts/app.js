const app = Vue.createApp({
  data() {
    return {
      playStatus: false,
      video: null,
      videoLoaded : false,
      playbackRate: 1.0,
      sliderMax: 0,
      sliderValue: 0,
      menuVisible: false,
      frameList : [],
      config : {
        leftBoxWidth : 60,
        rightBoxWidth : 40,
        title: "untitled",
        videoSrc : null,
        sliderRefreshTime : 1000,
      }
    };
  },
  mounted() {
    //initPage, configuratsyon dosyasi okunacak
    this.video = this.$refs.video;
    console.log("mounted Çalıştı");
  },
  methods: {
    addFrame(time) {
      var frame ={};
      frame.id = this.frameList.length + 1;
      frame.order = this.frameList.length + 1;
      frame.time = time;
      this.frameList.push(frame);
    },
    saveProject() {
      var link = this.$refs.download;
      var project = {};
      project.config = this.config;
      var content = JSON.stringify(project);      
      var fileName = "project.json";
      link.setAttribute('href',encodeURI('data:text/js;charset=utf-8,' + content));		
      link.setAttribute('download', fileName);
      link.click();
      
      
/*
      const data = { fileName: "bla bla", content: content };
      //axios.post("saveFile.php", data,  { "content-type": "application/json" })
      axios.get('saveFile.php', {
        params: {
          fileName: "blabla.json", content: "content"
        }
      })
        .then(response => 
          console.log("response:" + response)
          )
        .catch(error => console.log(error));

      */

      
    },
    updatePlaybackRate(sign) {
      if(sign == 0) {
        this.playbackRate = 1.0;
      } else  if(sign > 0 && this.playbackRate<2.0) {
        this.playbackRate = (parseFloat(this.playbackRate) + 0.1).toFixed(1);
      } else if(sign<0 && this.playbackRate>0.1) {
        this.playbackRate =  (this.playbackRate - 0.1).toFixed(1);
      } 
      this.video.playbackRate = this.playbackRate;
    },
    loadVideo() {
      this.config.videoSrc =  "\\videoNote\\media\\Snowman.mp4";         
      this.videoLoaded = true;     
    },
    playVideo() {     
      if(this.videoLoaded)  {
        this.playStatus = !this.playStatus;  
        if(this.sliderMax == 0 ) {
          this.sliderMax = this.video.duration;
        }
        if(this.playStatus) {
          this.video.play(); 
          this.playBar();
        } else {
          this.video.pause(); 
        }     
      }     
    },
    backwardVideo() {
      console.log("haydarrr" + this.video.currentTime);
      if(this.video.currentTime>this.playbackRate) {
        var newCurrentTime = this.video.currentTime-this.playbackRate;
        this.video.currentTime = newCurrentTime;
        this.sliderValue = newCurrentTime;
      }
    },
    playBar() {
      if(this.playStatus) {
          this.sliderValue = this.video.currentTime;
          if(this.sliderValue >= this.sliderMax) {
            this.playStatus = false;
          } else {
            setTimeout(()=> {this.playBar()},this.config.sliderRefreshTime); 
          } 
          console.log("helloo" + this.sliderValue);       
      }      
    },
    setCurrentTime(evt) {
      this.video.currentTime = evt.target.value;
    }
  },
  computed: {
    formattedTime() {
      var utcString = (new Date(Math.floor(this.sliderValue) * 1000)).toUTCString().match(/(\d\d:\d\d:\d\d)/)[0];
      return utcString.substring(3) + "." + ("000"+parseInt((this.sliderValue*1000)%1000)).slice(-3);
    }
  },
  watch: {
    playbackRate(newValue, oldValue)  {
      console.log("playbackRate New => Old", oldValue, newValue);
    },
  },
});

app.mount("#app");
