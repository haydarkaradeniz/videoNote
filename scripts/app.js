/*

commit #04.02.23-01

TO-DO LIST

-klavuz çizgisi ekleme
-tablature ön izleme görsel iyileştirme

-initializeGrid fonksiyonunu güncel grid values için değiştir.
- change butonu ile seçtiğin box top'ında seçili olduğunu belli eden bir çizgi olsun


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
      previewMenuVisible: false,
      frameList: [],
      selectedFrameId: 0,
      selectedFrameIndex: -1,
      selectedFrame: null,
      maxFrameId: 0,
      showArc: false,
      arcMode: false,
      notificationModal: {
        showModal: false
      },
      confirmationModal: {
        showModal: false,
        content: "",
        callBack: null,
      },
      gridModal: {
        grid: null,
        showModal: false,
        type: "",
        content: "",
        description: "",
        addGrid: false,
      },
      inputMode: "FRAME",
      config: {
        leftBoxWidth: 60,
        rightBoxWidth: 40,
        videoSrc: null,
        sliderRefreshTime: 1000,
        scrollTime: 100,
        frameBoxWidth: 35,
        gridBoxWidth: 65,
        gridModalWidth: 60,
        csvMaxRowCount: 49,
        csvMaxColCount: 2,
        csvSeperatorColCount: 1,
        arcSize: 10
      }
    };
  },
  mounted() {
    this.config = project.config;
    this.maxFrameId = project.maxFrameId ? project.maxFrameId : 0;
    this.frameList = project.frameList ? project.frameList : [];
    this.video = this.$refs.video;
    this.videoLoaded = true;
  },
  methods: {

    getScreenHeight() {
      return screen.height;
    },
    saveFile(fileName, content) {
      var link = this.$refs.download;
      link.setAttribute('href', encodeURI('data:text/js;charset=utf-8,' + content));
      link.setAttribute('download', fileName);
      link.click();
    },
    saveProject() {
      var project = {};
      project.config = this.config;
      project.maxFrameId = this.maxFrameId;
      project.frameList = this.filteredFrameList;
      project.config.arcSize = 10;
      var content = 'var project = ' + JSON.stringify(project) + ';';
      this.saveFile("project.js", content);
    },
    getFileName() {
      var tmpPath = this.config.videoSrc.split("\\");
      var tmpFile = tmpPath[tmpPath.length - 1].split(".");
      return tmpFile[0];
    },
    getAllGridList() {
      var allGridList = [];
      for (var i = 0; i < this.filteredFrameList.length; i++) {
        var filteredGridList = this.filteredFrameList[i].gridList
          .filter(o => o.deleted == 0)
          .sort((a, b) => a.order - b.order);
        for (var j = 0; j < filteredGridList.length; j++) {
          allGridList.push(filteredGridList[j]);
        }
      }
      return allGridList;
    },
    exportCsv() {
      var colSeperator = ",";
      var newLine = "\r\n";
      var emptyCell = "";
      var content = "";

      var maxRowCount = this.config.csvMaxRowCount;
      var maxColCount = this.config.csvMaxColCount;
      var seperatorColCount = this.config.csvSeperatorColCount;

      var allGridList = this.getAllGridList();

      //each page		
      for (var p = 0; p < Math.ceil(allGridList.length / (maxRowCount * maxColCount)); p++) {
        //each row
        for (var i = 0; i < maxRowCount; i++) {
          //each column
          for (var j = 0; j < maxColCount; j++) {
            var index = (p * maxColCount * maxRowCount) + (j * maxRowCount) + i;
            if (index < allGridList.length) {
              content = content
                + (allGridList[index].leftHandPosition ? allGridList[index].leftHandPosition : emptyCell) + colSeperator
                + (allGridList[index].leftHandNote ? allGridList[index].leftHandNote : emptyCell) + colSeperator
                + (allGridList[index].rightHandNote ? allGridList[index].rightHandNote : emptyCell) + colSeperator
                + (allGridList[index].rightHandPosition ? allGridList[index].rightHandPosition : emptyCell) + colSeperator;
            } else {
              content = content
                + emptyCell + colSeperator
                + emptyCell + colSeperator
                + emptyCell + colSeperator
                + emptyCell + colSeperator;
            }
            for (var t = 0; t < seperatorColCount; t++) {
              content = content + colSeperator;
            }
          }
          content = content + newLine;
        }
        content = content + "end of page " + (p + 1) + " " + newLine;
      }
      this.saveFile(this.getFileName() + ".csv", content);
    },
    checkGridSelected(gridId) {
      for (var i = 0; i < this.selectedFrame.selectedGridIdList.length; i++) {
        if (this.selectedFrame.selectedGridIdList[i] == gridId) {
          return true;
        }
      }
      return false;
    },
    fixedPositionGrid(x, y, canvasWidth, canvasHeight) {
      var position = {};      
      var currentCanvasWidth = this.$refs.video.clientWidth;
      var currentCanvasHeight = this.$refs.video.clientHeight;
      position.x = (x*currentCanvasWidth)/canvasWidth;
      position.y = (y*currentCanvasHeight)/canvasHeight;
      return position;
    },

    fillCanvas() {
      var ctx = this.$refs.canvas.getContext("2d");
      ctx.clearRect(0, 0, this.$refs.video.clientWidth, this.$refs.video.clientHeight);
      if (this.showArc && this.filteredGridList.length > 0) {
        //left hand marks

        ctx.lineWidth = 2;
        ctx.fillStyle = "#87AACF";
        for (var i = 0; i < this.filteredGridList.length; i++) {
          if (this.filteredGridList[i].leftPosition && this.filteredGridList[i].leftPosition.x) {
            ctx.strokeStyle = this.checkGridSelected(this.filteredGridList[i].id) ? "#FF0000" : "#FFFFFF";
            ctx.beginPath();
            var position = this.fixedPositionGrid(this.filteredGridList[i].leftPosition.x, this.filteredGridList[i].leftPosition.y, this.filteredGridList[i].leftPosition.canvasWidth, this.filteredGridList[i].leftPosition.canvasHeight);
            ctx.arc(position.x, position.y, this.config.arcSize, 0, 2 * Math.PI);
            ctx.fill();
            ctx.stroke();
          }
        }

        ctx.fillStyle = "#A1E55C";
        for (var i = 0; i < this.filteredGridList.length; i++) {
          if (this.filteredGridList[i].rightPosition && this.filteredGridList[i].rightPosition.x) {
            ctx.strokeStyle = this.checkGridSelected(this.filteredGridList[i].id) ? "#FF0000" : "#FFFFFF";
            ctx.beginPath();
            var position = this.fixedPositionGrid(this.filteredGridList[i].rightPosition.x, this.filteredGridList[i].rightPosition.y, this.filteredGridList[i].rightPosition.canvasWidth, this.filteredGridList[i].rightPosition.canvasHeight);
            ctx.arc(position.x, position.y, this.config.arcSize, 0, 2 * Math.PI);
            ctx.fill();
            ctx.stroke();
          }
        }

      }

    },
    setCursorPosition(event) {
      if (this.arcMode) {
        const rect = this.$refs.canvas.getBoundingClientRect();

        var position = {};
        position.x = event.clientX - rect.left;
        position.y = event.clientY - rect.top;
        position.canvasWidth = this.$refs.video.clientWidth;
        position.canvasHeight = this.$refs.video.clientHeight;

        if (this.gridModal.type == "LEFT_HAND_NOTE") {
          this.gridModal.grid.leftPosition = position;
        } else if (this.gridModal.type == "RIGHT_HAND_NOTE") {
          this.gridModal.grid.rightPosition = position;
        }
        this.arcMode = false;
        this.fillCanvas();
      }
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
        frame.selectAllGrid = false;
        this.frameList.push(frame);
        setTimeout(() => { this.scrollToElement(this.$refs.frameInnerBox) }, this.config.scrollTime);
        this.selectFrame(frame);
      }
    },
    selectFrame(selectedFrame, frameIndex = -1) {
      if (this.frameMode) {
        if (this.selectedFrameId == selectedFrame.id) {
          this.selectedFrameId = 0;
          this.selectedFrameIndex = -1;
          this.selectedFrame = null;
          this.video.currentTime = 0;
          this.sliderValue = 0;
        } else {
          this.selectedFrameId = selectedFrame.id;
          this.selectedFrame = selectedFrame;
          this.selectedFrameIndex = frameIndex < 0 ? this.filteredFrameList.length : frameIndex;
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
    initializeGrid(initializedGrid, grid) {
      initializedGrid.leftHandPosition = grid.leftHandPosition ? grid.leftHandPosition : "";
      initializedGrid.leftHandNote = grid.leftHandNote ? grid.leftHandNote : "";
      initializedGrid.rightHandPosition = grid.rightHandPosition ? grid.rightHandPosition : "";
      initializedGrid.rightHandNote = grid.rightHandNote ? grid.rightHandNote : "";
      initializedGrid.leftPosition = grid.leftPosition ? grid.leftPosition : {};
      initializedGrid.rightPosition = grid.rightPosition ? grid.rightPosition : {};
      return initializedGrid;
    },
    addGrid(grid, scrollElement = true) {
      //default values
      if (grid == null) {
        grid = this.initializeGrid({}, {});
      }
      this.selectedFrame.maxGridId += 1;
      grid.id = this.selectedFrame.maxGridId;
      grid.order = this.selectedFrame.maxGridId;
      grid.deleted = 0;
      this.selectedFrame.gridList.push(grid);
      this.selectedFrame.selectAllGrid = false;
      if (scrollElement) {
        setTimeout(() => { this.scrollToElement(this.$refs.gridInnerBox) }, this.config.scrollTime);
      }
    },
    checkInSelectedGridList(gridId) {
      for (var i = 0; i < this.selectedFrame.selectedGridIdList.length; i++) {
        if (gridId == this.selectedFrame.selectedGridIdList[i]) {
          return true;
        }
      }
      return false;
    },
    selectGrid(selectedGrid) {
      if (this.gridMode) {
        if (!this.selectedFrame.selectedGridIdList.includes(selectedGrid.id)) {
          this.selectedFrame.selectedGridIdList.push(selectedGrid.id);
          this.selectedFrame.selectedGridList.push(selectedGrid);
        } else {
          this.selectedFrame.selectedGridIdList = this.selectedFrame.selectedGridIdList.filter(o => o !== selectedGrid.id);
          this.selectedFrame.selectedGridList = this.filteredGridList.filter(o => this.checkInSelectedGridList(o.id));
        }
        this.selectedFrame.selectAllGrid = this.selectedFrame.selectedGridList.length != 0 && this.selectedFrame.selectedGridList.length == this.filteredGridList.length;
      }
    },
    selectAllGrid() {
      if (this.gridMode && this.filteredGridList.length > 0) {
        this.selectedFrame.selectAllGrid = !this.selectedFrame.selectAllGrid;
        this.selectedFrame.selectedGridIdList = [];
        this.selectedFrame.selectedGridIdList.length = 0;
        this.selectedFrame.selectedGridList = [];
        this.selectedFrame.selectedGridList.length = 0;
        if (this.selectedFrame.selectAllGrid) {
          for (var i = 0; i < this.filteredGridList.length; i++) {
            this.selectedFrame.selectedGridIdList.push(this.filteredGridList[i].id);
            this.selectedFrame.selectedGridList.push(this.filteredGridList[i]);
          }
        }
      }
    },
    pasteGrid() {
      if (this.selectedFrame.selectedGridList.length > 0) {
        do {
          var cloneGrid = this.initializeGrid({}, this.selectedFrame.selectedGridList[0]);
          this.selectGrid(this.selectedFrame.selectedGridList[0]);
          this.addGrid(cloneGrid, this.selectedFrame.selectedGridList.length == 0);
        } while (this.selectedFrame.selectedGridList.length > 0);
      }
    },
    deleteItem() {
      if (this.frameMode && this.selectedFrameId > 0) {
        this.selectedFrame.deleted = 1;
        //unselect
        this.selectFrame(this.selectedFrame);
      } else if (this.gridMode && this.selectedFrame.selectedGridList.length > 0) {
        do {
          this.selectedFrame.selectedGridList[0].deleted = 1;
          this.selectGrid(this.selectedFrame.selectedGridList[0]);
        } while (this.selectedFrame.selectedGridList.length > 0);
      }
    },
    clearGrid() {
      if (this.selectedFrame.selectedGridIdList.length > 0) {
        do {
          this.initializeGrid(this.selectedFrame.selectedGridList[0], {});
          this.selectGrid(this.selectedFrame.selectedGridList[0]);
        } while (this.selectedFrame.selectedGridList.length > 0);
        this.fillCanvas();
      }
    },
    swapPosition(direction) {
      if (this.selectedFrameId > 0 || this.selectedFrame.selectedGridIdList.length == 1) {
        var filteredList = this.frameMode ? this.filteredFrameList : this.filteredGridList;
        var selectedItemId = this.frameMode ? this.selectedFrameId : this.selectedFrame.selectedGridIdList[0];
        var itemList = this.frameMode ? this.frameList : this.selectedFrame.gridList;
        var prevIndex = {}, currentIndex = {}, nextIndex = {};

        for (var i = 0; i < filteredList.length; i++) {
          if (filteredList[i].id == selectedItemId) {
            currentIndex.id = filteredList[i].id;
            currentIndex.order = filteredList[i].order;
            if (i > 0) {
              prevIndex.id = filteredList[i - 1].id;
              prevIndex.order = filteredList[i - 1].order;
            }
            if (i < filteredList.length - 1) {
              nextIndex.id = filteredList[i + 1].id;
              nextIndex.order = filteredList[i + 1].order;
            }
          }
        }

        if ((direction == 'down' && nextIndex.id) || (direction == 'up' && prevIndex.id)) {
          for (var i = 0; i < itemList.length; i++) {
            if (itemList[i].id == prevIndex.id) {
              prevIndex.index = i;
            }
            else if (itemList[i].id == currentIndex.id) {
              currentIndex.index = i;
            }
            else if (itemList[i].id == nextIndex.id) {
              nextIndex.index = i;
            }
          }

          if (direction == 'up') {
            itemList[prevIndex.index].order = currentIndex.order;
            itemList[currentIndex.index].order = prevIndex.order;
          } else {
            itemList[currentIndex.index].order = nextIndex.order;
            itemList[nextIndex.index].order = currentIndex.order;
          }
        }
      }
    },
    showGridModal(grid, type, addGrid = false) {
      if (this.gridMode) {
        this.gridModal.grid = grid;
        this.gridModal.type = type;
        this.gridModal.addGrid = addGrid;
        switch (type) {
          case "LEFT_HAND_POSITION": {
            this.gridModal.content = grid.leftHandPosition;
            this.gridModal.description = "Left Hand Position";
            break;
          }
          case "LEFT_HAND_NOTE": {
            this.gridModal.content = grid.leftHandNote;
            this.gridModal.description = "Left Hand Note";
            break;
          }
          case "RIGHT_HAND_POSITION": {
            this.gridModal.content = grid.rightHandPosition;
            this.gridModal.description = "Right Hand Position";
            break;
          }
          case "RIGHT_HAND_NOTE": {
            this.gridModal.content = grid.rightHandNote;
            this.gridModal.description = "Right Hand Note";
            break;
          }
        }
        this.gridModal.showModal = true;
      }
    },
    applyGridModal() {
      var tmpGrid = {};
      switch (this.gridModal.type) {
        case "LEFT_HAND_POSITION": {
          this.gridModal.grid.leftHandPosition = this.gridModal.content;
          tmpGrid.leftHandPosition = this.gridModal.content;
          break;
        }
        case "LEFT_HAND_NOTE": {
          this.gridModal.grid.leftHandNote = this.gridModal.content;
          tmpGrid.leftHandNote = this.gridModal.content;
          break;
        }
        case "RIGHT_HAND_POSITION": {
          this.gridModal.grid.rightHandPosition = this.gridModal.content;
          tmpGrid.rightHandPosition = this.gridModal.content;
          break;
        }
        case "RIGHT_HAND_NOTE": {
          this.gridModal.grid.rightHandNote = this.gridModal.content;
          tmpGrid.rightHandNote = this.gridModal.content;
          break;
        }
      }
      if (this.gridModal.addGrid) {
        this.addGrid(this.gridModal.grid, true);
        this.gridModal.addGrid = false;
      }
      this.gridModal.showModal = false;
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
      if (this.selectedFrameId > 0) {
        this.selectedFrame.time = this.video.currentTime;
      }
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
    },
    showConfirmation(content, callBack) {
      if ((this.frameMode && this.selectedFrameId > 0) || (this.gridMode && this.selectedFrame.selectedGridIdList.length > 0)) {
        this.confirmationModal.content = content;
        this.confirmationModal.callBack = callBack;
        this.confirmationModal.showModal = true;
      }
    },
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
    leftHandRootPosition() {
      var rootPosition = "---";
      var maxFrameIndex = this.selectedFrameIndex > this.filteredFrameList.length - 1 ? this.filteredFrameList.length - 1 : this.selectedFrameIndex;
      for (var i = maxFrameIndex; i > -1 && rootPosition == "---"; i--) {
        for (var j = this.filteredFrameList[i].gridList.length - 1; j > -1; j--) {
          if (!this.filteredFrameList[i].gridList[j].deleted && this.filteredFrameList[i].gridList[j].leftHandPosition.length > 0) {
            rootPosition = this.filteredFrameList[i].gridList[j].leftHandPosition;
            break;
          }
        }
      }
      return rootPosition;
    },
    rightHandRootPosition() {
      var rootPosition = "---";
      var maxFrameIndex = this.selectedFrameIndex > this.filteredFrameList.length - 1 ? this.filteredFrameList.length - 1 : this.selectedFrameIndex;
      for (var i = maxFrameIndex; i > -1 && rootPosition == "---"; i--) {
        for (var j = this.filteredFrameList[i].gridList.length - 1; j > -1; j--) {
          if (!this.filteredFrameList[i].gridList[j].deleted && this.filteredFrameList[i].gridList[j].rightHandPosition.length > 0) {
            rootPosition = this.filteredFrameList[i].gridList[j].rightHandPosition;
            break;
          }
        }
      }
      return rootPosition;
    }
  },
  watch: {
    playbackRate(newValue, oldValue) {
      console.log("playbackRate New => Old", oldValue, newValue);
    },
    selectedFrameId(newValue, oldValue) {
      this.fillCanvas();
    },
    showArc(newValue, oldValue) {
      this.fillCanvas();
    },
    selectedFrame: {
      deep: true, handler(newValue) {
        this.fillCanvas();
      }
    }
  },
});

app.mount("#app");
