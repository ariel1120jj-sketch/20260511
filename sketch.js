let capture;
let faceMesh;
let handPose;
let faces = [];
let hands = [];
let earringImages = [];
let currentEarringIndex = 0; // 預設顯示第一款耳環

// 偵測設定
let faceOptions = { maxFaces: 1, refineLandmarks: true, flipHorizontal: false };
let handOptions = { maxHands: 1, flipHorizontal: false };

function preload() {
  // 載入 FaceMesh 與 HandPose 模型
  faceMesh = ml5.faceMesh(faceOptions);
  handPose = ml5.handPose(handOptions);
  
  // 載入 5 款耳環圖片
  earringImages[0] = loadImage('pic/acc1_ring.png');
  earringImages[1] = loadImage('pic/acc2_pearl.png');
  earringImages[2] = loadImage('pic/acc3_tassel.png');
  earringImages[3] = loadImage('pic/acc4_jade.png');
  earringImages[4] = loadImage('pic/acc5_phoenix.png');
}

function setup() {
  // 建立全螢幕畫布
  createCanvas(windowWidth, windowHeight);
  
  // 擷取攝影機影像，設定一個穩定的解析度
  capture = createCapture(VIDEO);
  capture.size(640, 480);
  capture.hide(); // 隱藏預設的 HTML 影片元件

  // 開始偵測臉部
  faceMesh.detectStart(capture, gotFaces);
  // 開始偵測手部
  handPose.detectStart(capture, gotHands);
}

function draw() {
  // 設定背景顏色為 指定的粉紫色 (#e7c6ff)
  background('#e7c6ff');

  // 計算顯示影像的尺寸：維持全螢幕寬高各 50%
  let vWidth = windowWidth * 0.5;
  let vHeight = windowHeight * 0.5;
  
  // 計算置中座標
  let x = (width - vWidth) / 2;
  let y = (height - vHeight) / 2;

  push();
  // 將原點移動到顯示區域的左上角基準點
  translate(x, y);
  
  // 實作左右顛倒（鏡像）：移動到顯示區域的右側，然後水平翻轉座標系
  translate(vWidth, 0);
  scale(-1, 1);

  // 在翻轉後的座標系中繪製影像，影像本身會呈現鏡像效果
  image(capture, 0, 0, vWidth, vHeight);

  // --- 手勢辨識與切換邏輯 ---
  if (hands.length > 0) {
    let fingerCount = countFingers(hands[0]);
    // 如果手指數量在 1-5 之間，更新目前的耳環索引
    if (fingerCount >= 1 && fingerCount <= 5) {
      currentEarringIndex = fingerCount - 1;
    }
  }

  // --- 繪製耳垂上的耳環影像 ---
  if (faces.length > 0) {
    let face = faces[0];
    
    // 關鍵修正：FaceMesh 特徵點選取
    // 原始特徵點編號 234 和 454 通常位於臉頰側面的邊緣，不夠穩定。
    // 這裡我們改用更精確的「耳垂下方」邊緣參考點：
    // 特徵點編號 147 接近右側耳垂區域
    // 特徵點編號 376 接近左側耳垂區域
    let keypoints = [face.keypoints[147], face.keypoints[376]];

    // 關鍵修正：座標精確映射 (Mapping)
    // 我們需要將「攝影機原始解析度 (640x480)」的偵測點坐标，
    // 映射到「畫布上顯示的影像尺寸 (vWidth x vHeight)」上。
    
    imageMode(CENTER); // 設定圖片以中心點定位
    for (let i = 0; i < keypoints.length; i++) {
      let pt = keypoints[i];
      if (pt) {
        // 使用 map 函數進行座標轉換
        let mappedX = map(pt.x, 0, capture.width, 0, vWidth);
        let mappedY = map(pt.y, 0, capture.height, 0, vHeight);
        
        // 計算耳環大小（設為顯示寬度的 8%，讓它隨畫面大小縮放）
        let eSize = vWidth * 0.08;
        
        // 畫出耳環圖片
        image(earringImg, mappedX, mappedY, eSize, eSize);
      }
    }
    imageMode(CORNER); // 重設回預設模式，以免影響其他繪圖
  }
  pop();
}

function gotFaces(results) {
  // 更新偵測到的臉部數據
  faces = results;
}

function windowResized() {
  // 當視窗大小改變（如平板轉橫向）時，動態重新調整畫布大小，維持全螢幕
  resizeCanvas(windowWidth, windowHeight);
}