let capture;
let faceMesh;
let faces = [];
let options = { maxFaces: 1, refineLandmarks: false, flipHorizontal: false };

function preload() {
  // 載入 ml5 臉部偵測模型
  faceMesh = ml5.faceMesh(options);
}

function setup() {
  createCanvas(windowWidth, windowHeight);
  
  // 啟動攝影機
  capture = createCapture(VIDEO);
  capture.size(640, 480);
  capture.hide();

  // 開始偵測臉部
  faceMesh.detectStart(capture, gotFaces);
}

function draw() {
  background('#e7c6ff'); // 設定背景色

  let vWidth = windowWidth * 0.5;
  let vHeight = windowHeight * 0.5;
  let xPos = (width - vWidth) / 2;
  let yPos = (height - vHeight) / 2;

  push();
  // 移動到置中區域並翻轉鏡像
  translate(xPos + vWidth, yPos);
  scale(-1, 1);

  // 繪製攝影機影像
  image(capture, 0, 0, vWidth, vHeight);

  // 如果偵測到臉部，畫出耳垂點
  if (faces.length > 0) {
    let face = faces[0];
    
    // 取得左右耳垂附近的關鍵點 (234, 454)
    let keypoints = [face.keypoints[234], face.keypoints[454]];

    fill(255, 255, 0); // 黃色
    noStroke();

    for (let pt of keypoints) {
      if (pt) {
        // 將攝影機座標 (640x480) 映射到顯示畫面的大小 (vWidth x vHeight)
        let mappedX = map(pt.x, 0, capture.width, 0, vWidth);
        let mappedY = map(pt.y, 0, capture.height, 0, vHeight);
        circle(mappedX, mappedY, 20); // 畫出黃色圓圈
      }
    }
  }
  pop();
}

function gotFaces(results) {
  faces = results;
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}