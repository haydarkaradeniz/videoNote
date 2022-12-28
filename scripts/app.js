/*

commit #15.12.22-01

TO-DO LIST
- yukarı ve aşağı SVG'leri düzenle
- yukarı ve aşağı fonksiyonunu yaz
- aynı time için frame ekleme kontrolü koy
- set time svg'sini düzenle
- set time fonksiyonu yaz
- grid box çerçevesini oluştur





*/

const app = Vue.createApp({
  data() {
    return {
      playStatus: false,
      video: null,
      videoLoaded: false,
      playbackRate: 1.0,
      sliderMax: 0,
      sliderValue: 0,
      configMenuVisible: false,
      frameList: [],
      selectedFrameId: 0,
      selectedFrame: null,
      maxFrameId: 0,
      showModal: false,
      config: {
        leftBoxWidth: 60,
        rightBoxWidth: 40,
        videoSrc: null,
        sliderRefreshTime: 1000,
      }
    };
  },
  mounted() {
    this.config = project.config;
    this.video = this.$refs.video;
    this.videoLoaded = true;
  },
  methods: {
    saveProject() {
      var link = this.$refs.download;
      var project = {};
      project.config = this.config;
      var content = 'var project = ' + JSON.stringify(project) + ';';
      link.setAttribute('href', encodeURI('data:text/js;charset=utf-8,' + content));
      link.setAttribute('download', "project.js");
      link.click();
    },
    updatePlaybackRate(sign) {
      if (sign == 0) {
        this.playbackRate = 1.0;
      } else if (sign > 0 && this.playbackRate < 2.0) {
        this.playbackRate = (parseFloat(this.playbackRate) + 0.1).toFixed(1);
      } else if (sign < 0 && this.playbackRate > 0.1) {
        this.playbackRate = (this.playbackRate - 0.1).toFixed(1);
      }
      this.video.playbackRate = this.playbackRate;
    },

    playVideo() {
      if (this.videoLoaded) {
        this.playStatus = !this.playStatus;
        if (this.sliderMax == 0) {
          this.sliderMax = this.video.duration;
        }
        if (this.playStatus) {
          this.video.play();
          this.playBar();
        } else {
          this.video.pause();
        }
      }
    },
    backwardVideo() {
      if (this.video.currentTime > this.playbackRate) {
        var newCurrentTime = this.video.currentTime - this.playbackRate;
        this.video.currentTime = newCurrentTime;
        this.sliderValue = newCurrentTime;
      }
    },
    playBar() {
      if (this.playStatus) {
        this.sliderValue = this.video.currentTime;
        if (this.sliderValue >= this.sliderMax) {
          this.playStatus = false;
        } else {
          setTimeout(() => { this.playBar() }, this.config.sliderRefreshTime);
        }
      }
    },
    setCurrentTime(evt) {
      this.video.currentTime = evt.target.value;
    },
    addFrame() {
      var frame = {};
      this.maxFrameId += 1;
      frame.id = this.maxFrameId;
      frame.order = this.maxFrameId
      frame.time = this.video.currentTime;
      frame.deleted = 0;
      this.frameList.push(frame);
      this.scrollToElement(this.$refs.frameInnerBox);
    },
    selectFrame(selectedFrame) {
      if (this.selectedFrameId == selectedFrame.id) {
        this.selectedFrameId = 0;
        this.selectedFrame = null;
      } else {
        this.selectedFrameId = selectedFrame.id;
        this.selectedFrame = selectedFrame;
      }
    },
    deleteItem() {
      if (this.selectedFrameId > 0) {
        this.selectedFrame.deleted = 1;
        //default
        this.selectFrame(0);
      } else {

      }
    },
    scrollToElement(el) {
      if (el) {
        el.scrollTop = el.scrollHeight;
      }
    }
  },
  computed: {
    formattedTime() {
      var utcString = (new Date(Math.floor(this.sliderValue) * 1000)).toUTCString().match(/(\d\d:\d\d:\d\d)/)[0];
      return utcString.substring(3) + "." + ("000" + parseInt((this.sliderValue * 1000) % 1000)).slice(-3);
    },
    filteredFrameList() {
      return this.frameList
        .filter(o => o.deleted == 0)
        .sort((a, b) => a.order - b.order);
    },
  },
  watch: {
    playbackRate(newValue, oldValue) {
      console.log("playbackRate New => Old", oldValue, newValue);
    },
  },
});

app.mount("#app");
