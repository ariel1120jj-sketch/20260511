let capture;
let faceMesh;
let faces = [];
let options = { maxFaces: 1, refineLandmarks: false, flipHorizontal: false };

function preload() {
  // 載入 FaceMesh 模型
  faceMesh = ml5.faceMesh(options);
}

function setup() {
  // 建立全螢幕畫布
  createCanvas(windowWidth, windowHeight);

  // 擷取攝影機影像
  capture = createCapture(VIDEO);
  capture.size(640, 480);
  capture.hide();

  // 開始偵測臉部
  faceMesh.detectStart(capture, gotFaces);
}

function draw() {
  // 背景設定為 e7c6ff (粉紫色)
  background('#e7c6ff');

  // 計算顯示影像的寬高（視窗寬高的 50%）
  let vWidth = windowWidth * 0.5;
  let vHeight = windowHeight * 0.5;

  // 計算置中座標
  let x = (width - vWidth) / 2;
  let y = (height - vHeight) / 2;

  push();
  // --- 鏡像處理與置中 ---
  // 先移動到顯示區域的中心，進行水平翻轉，再移回原點
  translate(x + vWidth, y);
  scale(-1, 1);

  // 繪製攝影機影像
  image(capture, 0, 0, vWidth, vHeight);

  // --- 繪製耳垂標記 ---
  if (faces.length > 0) {
    let face = faces[0];
    
    // FaceMesh 特徵點索引：
    // 左耳垂附近點位約為 132, 161 (依模型而定，此處選用邊緣參考點)
    // 這裡選用常用的耳垂參考點：234 (右臉側), 454 (左臉側)
    // 註：因為我們用了 scale(-1, 1)，畫布座標會自動對應鏡像
    
    let leftEar = face.keypoints[234];  // 左側參考點
    let rightEar = face.keypoints[454]; // 右側參考點

    fill(255, 255, 0); // 黃色
    noStroke();

    // 映射座標：將原始影像座標映射到畫布縮放後的寬高
    let lx = map(leftEar.x, 0, capture.width, 0, vWidth);
    let ly = map(leftEar.y, 0, capture.height, 0, vHeight);
    let rx = map(rightEar.x, 0, capture.width, 0, vWidth);
    let ry = map(rightEar.y, 0, capture.height, 0, vHeight);

    // 畫出耳垂位置的黃色圓圈
    circle(lx, ly, 15);
    circle(rx, ry, 15);
  }
  pop();
}

function gotFaces(results) {
  // 更新偵測到的臉部數據
  faces = results;
}

function windowResized() {
  // 視窗縮放時重新調整畫布
  resizeCanvas(windowWidth, windowHeight);
}