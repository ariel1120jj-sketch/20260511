let capture;
let faceMesh;
let faces = [];
// 設定偵測參數：開啟細節點位辨識
let options = { maxFaces: 1, refineLandmarks: true, flipHorizontal: false };

function preload() {
  // 載入 FaceMesh 模型
  faceMesh = ml5.faceMesh(options);
}

function setup() {
  // 1. 建立全螢幕畫布
  createCanvas(windowWidth, windowHeight);

  // 2. 啟動攝影機，並加入錯誤處理
  capture = createCapture(VIDEO, {
    video: {
      width: 640,
      height: 480
    },
    audio: false
  }, function(stream) {
    console.log("攝影機啟動成功！");
  });

  capture.size(640, 480);
  capture.hide(); // 隱藏原始 HTML 影片元件

  // 3. 開始偵測臉部
  faceMesh.detectStart(capture, gotFaces);
}

function draw() {
  // 設定背景顏色為 e7c6ff (粉紫色)
  background('#e7c6ff');

  // 計算全螢幕 50% 的影像尺寸
  let vWidth = windowWidth * 0.5;
  let vHeight = windowHeight * 0.5;
  
  // 計算畫面中央位置
  let x = (width - vWidth) / 2;
  let y = (height - vHeight) / 2;

  push();
  // --- 鏡像與位移邏輯 ---
  // 先移到置中座標
  translate(x, y);
  // 再移到該區域的右側並水平翻轉 (scale -1) 達到鏡像效果
  translate(vWidth, 0);
  scale(-1, 1);

  // 繪製攝影機影像
  image(capture, 0, 0, vWidth, vHeight);

  // --- 繪製耳垂黃色圓圈 ---
  if (faces.length > 0) {
    let face = faces[0];
    
    // 選取最接近「耳垂」底部的特徵點
    // 147: 右側耳垂點 (鏡像後顯示在左邊)
    // 376: 左側耳垂點 (鏡像後顯示在右邊)
    let earPoints = [face.keypoints[147], face.keypoints[376]];

    fill(255, 255, 0); // 黃色
    noStroke();

    for (let pt of earPoints) {
      if (pt) {
        // 關鍵：將偵測到的 640x480 座標映射到實際顯示的 vWidth x vHeight
        let mx = map(pt.x, 0, capture.width, 0, vWidth);
        let my = map(pt.y, 0, capture.height, 0, vHeight);
        
        // 畫出圓圈
        circle(mx, my, 22); 
      }
    }
  }
  pop();
}

function gotFaces(results) {
  faces = results;
}

function windowResized() {
  // 當視窗大小改變或平板轉向時，自動修正畫布尺寸
  resizeCanvas(windowWidth, windowHeight);
}