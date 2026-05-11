let capture;
let faceMesh;
let faces = [];

function preload() {
  // 載入 ml5.js 的 faceMesh 模型
  faceMesh = ml5.faceMesh();
}

function setup() {
  // 建立全螢幕畫布
  createCanvas(windowWidth, windowHeight);
  // 擷取攝影機影像
  capture = createCapture(VIDEO);
  capture.size(640, 480);
  // 隱藏預設的 HTML 影片元件，避免在畫布下方出現重複影像
  capture.hide();

  // 開始對攝影機影像進行臉部偵測
  faceMesh.detectStart(capture, (results) => {
    faces = results;
  });
}

function draw() {
  // 設定背景顏色為 e7c6ff
  background('#e7c6ff');

  // 計算顯示影像的寬高（視窗的 50%）
  let vWidth = windowWidth * 0.5;
  let vHeight = windowHeight * 0.5;
  
  // 計算置中座標
  let x = (width - vWidth) / 2;
  let y = (height - vHeight) / 2;

  push();
  // 實作左右顛倒：將座標移至目標區域的右側，然後水平翻轉
  translate(x + vWidth, y);
  scale(-1, 1);
  // 繪製影像，從翻轉後的原點開始繪製
  image(capture, 0, 0, vWidth, vHeight);

  // 如果偵測到臉部，則繪製耳垂位置
  if (faces.length > 0) {
    let face = faces[0];
    // 取得左右耳垂附近的關鍵點 (234 為右耳區域, 454 為左耳區域)
    let earPoints = [face.keypoints[234], face.keypoints[454]];

    fill(255, 255, 0); // 設定圓圈顏色為黃色
    noStroke();

    for (let pt of earPoints) {
      // 將攝影機原始座標映射到畫布上的顯示大小 (50% 寬高)
      let mappedX = map(pt.x, 0, capture.width, 0, vWidth);
      let mappedY = map(pt.y, 0, capture.height, 0, vHeight);
      circle(mappedX, mappedY, 15); // 在耳垂位置畫出黃色圓圈
    }
  }
  pop();
}

function windowResized() {
  // 當視窗大小改變時，重新調整畫布大小以維持全螢幕
  resizeCanvas(windowWidth, windowHeight);
}