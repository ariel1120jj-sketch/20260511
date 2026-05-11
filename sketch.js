let capture;
let faceMesh;
let faces = [];
let options = { maxFaces: 1, refineLandmarks: false, flipHorizontal: false };

function preload() {
  // 載入 ml5 臉部偵測模型
  faceMesh = ml5.faceMesh(options);
}

function setup() {
  // 建立全螢幕畫布
  createCanvas(windowWidth, windowHeight);
  
  // 啟動攝影機
  capture = createCapture(VIDEO);
  capture.size(640, 480);
  capture.hide();

  // 開始偵測臉部
  faceMesh.detectStart(capture, gotFaces);
}

function draw() {
  background('#e7c6ff'); // 指定的粉紫色背景

  // 動態計算顯示影像的寬高（全螢幕寬高的一半）
  let vWidth = windowWidth * 0.5;
  let vHeight = windowHeight * 0.5;
  
  // 置中座標
  let xPos = (width - vWidth) / 2;
  let yPos = (height - vHeight) / 2;

  push();
  // --- 處理鏡像與置中 ---
  translate(xPos + vWidth, yPos); // 移至繪製區域的右側
  scale(-1, 1);                   // 水平翻轉

  // 繪製攝影機影像
  image(capture, 0, 0, vWidth, vHeight);

  // --- 繪製耳環 ---
  if (faces.length > 0) {
    let face = faces[0];
    
    // 取得臉部邊緣特徵點
    // 234: 右臉頰/耳垂區域 (對應影像左側)
    // 454: 左臉頰/耳垂區域 (對應影像右側)
    let leftEarPoint = face.keypoints[234];
    let rightEarPoint = face.keypoints[454];

    fill(255, 255, 0); // 黃色
    noStroke();

    if (leftEarPoint && rightEarPoint) {
      // 將攝影機座標 (640x480) 映射到當前畫布上的影像大小 (vWidth x vHeight)
      let lx = map(leftEarPoint.x, 0, capture.width, 0, vWidth);
      let ly = map(leftEarPoint.y, 0, capture.height, 0, vHeight);
      
      let rx = map(rightEarPoint.x, 0, capture.width, 0, vWidth);
      let ry = map(rightEarPoint.y, 0, capture.height, 0, vHeight);

      // 微調：耳垂通常在臉頰邊緣點稍微往下、往內一點點
      // 如果位置太高，可以嘗試在 ly 和 ry 加上一個微小的偏移量，例如 +10
      circle(lx, ly + 5, 15); 
      circle(rx, ry + 5, 15);
    }
  }
  pop();
}

function gotFaces(results) {
  faces = results;
}

// 當手機或視窗由直向轉為橫向時，自動重新計算畫布與元件位置
function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}