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
  capture.size(640, 480); // 設定擷取解析度
  capture.hide();

  // 開始偵測臉部
  faceMesh.detectStart(capture, gotFaces);
}

function draw() {
  // 設定背景色為 e7c6ff
  background('#e7c6ff');

  // 動態計算：影像寬高維持為畫布的 50%
  let vWidth = windowWidth * 0.5;
  let vHeight = windowHeight * 0.5;
  
  // 計算置中位置
  let xPos = (width - vWidth) / 2;
  let yPos = (height - vHeight) / 2;

  push();
  // 1. 先移動到顯示區域的左上角基準點
  translate(xPos, yPos);
  
  // 2. 處理左右顛倒（鏡像）：移動到該區域的寬度位置後，水平翻轉
  translate(vWidth, 0);
  scale(-1, 1);

  // 繪製攝影機影像（現在是鏡像且置中的狀態）
  image(capture, 0, 0, vWidth, vHeight);

  // 3. 繪製耳垂上的黃色圓圈
  if (faces.length > 0) {
    let face = faces[0];
    
    // FaceMesh 耳垂附近的關鍵點索引：
    // 234 為臉部右側邊緣（鏡像後看起來在左邊）
    // 454 為臉部左側邊緣（鏡像後看起來在右邊）
    let leftEarPoint = face.keypoints[234];
    let rightEarPoint = face.keypoints[454];

    fill(255, 255, 0); // 黃色
    noStroke();

    // 關鍵修正：將原始偵測點 (capture 尺寸) 精確對應到目前畫布上的影像尺寸 (vWidth/vHeight)
    if (leftEarPoint) {
      let lx = map(leftEarPoint.x, 0, capture.width, 0, vWidth);
      let ly = map(leftEarPoint.y, 0, capture.height, 0, vHeight);
      circle(lx, ly, 20); 
    }

    if (rightEarPoint) {
      let rx = map(rightEarPoint.x, 0, capture.width, 0, vWidth);
      let ry = map(rightEarPoint.y, 0, capture.height, 0, vHeight);
      circle(rx, ry, 20);
    }
  }
  pop();
}

function gotFaces(results) {
  faces = results;
}

function windowResized() {
  // 當畫面轉為橫向或縮放時，重新調整畫布尺寸
  resizeCanvas(windowWidth, windowHeight);
}