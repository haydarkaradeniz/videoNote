/*

commit #07.01.23-01

TO-DO LIST


- change butonu ile seçtiğin box top'ında seçili olduğunu belli eden bir çizgi olsun
- grid içeriğini tasarla



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
      notificationModal: {
        showModal: false
      },
      inputMode: "FRAME",
      config: {
        leftBoxWidth: 60,
        rightBoxWidth: 40,
        videoSrc: null,
        sliderRefreshTime: 1000,
        frameBoxWidth: 35,
        gridBoxWidth: 65
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
      if (this.checkFrameTime()) {
        var frame = {};
        this.maxFrameId += 1;
        frame.id = this.maxFrameId;
        frame.order = this.maxFrameId
        frame.time = this.video.currentTime;
        frame.deleted = 0;
        frame.gridList = [];
        frame.selectedGridIdList = [];
        frame.selectedGridList = [];
        frame.maxGridId = 0;
        this.frameList.push(frame);
        this.scrollToElement(this.$refs.frameInnerBox);
        this.selectFrame(frame);
      }
    },
    selectFrame(selectedFrame) {
      if (this.frameMode) {
        if (this.selectedFrameId == selectedFrame.id) {
          this.selectedFrameId = 0;
          this.selectedFrame = null;
          this.video.currentTime = 0;
          this.sliderValue = 0;
        } else {
          this.selectedFrameId = selectedFrame.id;
          this.selectedFrame = selectedFrame;
          this.video.currentTime = selectedFrame.time;
          this.sliderValue = selectedFrame.time;
        }
      }
    },
    changeInputMode() {
      if (this.changeInputModeAvailable) {
        this.inputMode = this.inputMode == "FRAME" ? "GRID" : "FRAME";
      }
    },
    addGrid() {
      var grid = {};
      this.selectedFrame.maxGridId += 1;
      grid.id = this.selectedFrame.maxGridId;
      grid.order = this.selectedFrame.maxGridId;
      grid.deleted = 0;
      this.selectedFrame.gridList.push(grid);
      this.scrollToElement(this.$refs.gridInnerBox);
    },
    checkInSelectedGridList(gridId) {
      for(var i=0; i<this.selectedFrame.selectedGridIdList.length; i++) {
        if(gridId == this.selectedFrame.selectedGridIdList[i]) {
          return true;
        }
      }
      return false;
    },
    selectGrid(selectedGrid) {
      if (this.gridMode) {
        if(!this.selectedFrame.selectedGridIdList.includes(selectedGrid.id)) {
          this.selectedFrame.selectedGridIdList.push(selectedGrid.id);
          this.selectedFrame.selectedGridList.push(selectedGrid);
        } else {
          this.selectedFrame.selectedGridIdList = this.selectedFrame.selectedGridIdList.filter(o => o !== selectedGrid.id);
          this.selectedFrame.selectedGridList = this.selectedFrame.gridList.filter(o => this.checkInSelectedGridList(o.id));
        }
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
    swapFramePosition(direction) {
      var prevIndex = {}, currentIndex = {}, nextIndex = {};
      for (var i = 0; i < this.filteredFrameList.length; i++) {
        if (this.filteredFrameList[i].id == this.selectedFrameId) {
          currentIndex.id = this.filteredFrameList[i].id;
          currentIndex.order = this.filteredFrameList[i].order;
          if (i > 0) {
            prevIndex.id = this.filteredFrameList[i - 1].id;
            prevIndex.order = this.filteredFrameList[i - 1].order;
          }
          if (i < this.filteredFrameList.length - 1) {
            nextIndex.id = this.filteredFrameList[i + 1].id;
            nextIndex.order = this.filteredFrameList[i + 1].order;
          }
        }
      }

      if ((direction == 'down' && nextIndex.id) || (direction == 'up' && prevIndex.id)) {
        for (var i = 0; i < this.frameList.length; i++) {
          if (this.frameList[i].id == prevIndex.id) {
            prevIndex.index = i;
          }
          else if (this.frameList[i].id == currentIndex.id) {
            currentIndex.index = i;
          }
          else if (this.frameList[i].id == nextIndex.id) {
            nextIndex.index = i;
          }
        }

        if (direction == 'up') {
          this.frameList[prevIndex.index].order = currentIndex.order;
          this.frameList[currentIndex.index].order = prevIndex.order;
        } else {
          this.frameList[currentIndex.index].order = nextIndex.order;
          this.frameList[nextIndex.index].order = currentIndex.order;
        }
      }
    },
    checkFrameTime() {
      for (var i = 0; i < this.filteredFrameList.length; i++) {
        if (this.filteredFrameList[i].time == this.video.currentTime) {
          this.showWarningMessage("This time already added as frame " + ("000" + (i + 1)).slice(-3));
          return false;
        }
      }
      return true;
    },
    setFrameTime() {
      this.selectedFrame.time = this.video.currentTime;
    },
    scrollToElement(el) {
      if (el) {
        el.scrollTop = el.scrollHeight;
      }
    },
    showWarningMessage(text) {
      this.showNotification("WARNING", "Warning Message", text);
    },
    showInfoMessage(text) {
      this.showNotification("INFO", "Info Message", text);
    },
    showErrorMessage(text) {
      this.showNotification("ERROR", "Error Message", text);
    },
    showNotification(type, header, content) {
      if (type == 'INFO') {
        this.notificationModal.img = "images/modal-info.svg";
      } else if (type == 'WARNING') {
        this.notificationModal.img = "images/modal-warning.svg";
      } else {
        this.notificationModal.img = "images/modal-error.svg";
      }
      this.notificationModal.header = header;
      this.notificationModal.content = content;
      this.notificationModal.showModal = true;
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
    filteredGridList() {
      if (this.selectedFrame != null) {
        return this.selectedFrame.gridList
          .filter(o => o.deleted == 0)
          .sort((a, b) => a.order - b.order);
      } else {
        return [];
      }
    },
    gridMode() {
      return this.inputMode == "GRID";
    },
    frameMode() {
      return this.inputMode == "FRAME";
    },
    changeInputModeAvailable() {
      return !this.frameMode || this.selectedFrameId > 0;
    },
  },
  watch: {
    playbackRate(newValue, oldValue) {
      console.log("playbackRate New => Old", oldValue, newValue);
    },
  },
});

app.mount("#app");
