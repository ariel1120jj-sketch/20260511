let capture;
let faceMesh;
let handPose;
let faces = [];
let hands = [];
let earringImages = [];
let maskImages = [];
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

  // 載入 5 款面具圖片 (從 mask 資料夾)
  maskImages[0] = loadImage('mask/4379901.png');
  maskImages[1] = loadImage('mask/4379902.png');
  maskImages[2] = loadImage('mask/mask1_red.png');
  maskImages[3] = loadImage('mask/mask2_blue.png');
  maskImages[4] = loadImage('mask/mask3_gold.png');
  maskImages[5] = loadImage('mask/mask4_white.png');
}

function setup() {
  // 建立全螢幕畫布
  createCanvas(windowWidth, windowHeight);
  
  // 擷取攝影機影像
  capture = createCapture(VIDEO);
  capture.size(640, 480);
  capture.hide(); 

  // 開始偵測
  faceMesh.detectStart(capture, gotFaces);
  handPose.detectStart(capture, gotHands);
}

function draw() {
  background('#e7c6ff'); // 背景粉紫色

  let vWidth = windowWidth * 0.5;
  let vHeight = windowHeight * 0.5;
  let x = (width - vWidth) / 2;
  let y = (height - vHeight) / 2;

  push();
  // 置中並處理鏡像
  translate(x, y);
  translate(vWidth, 0);
  scale(-1, 1);

  // 繪製影像
  image(capture, 0, 0, vWidth, vHeight);

  // --- 手勢辨識與切換邏輯 ---
  if (hands.length > 0) {
    let fingerCount = countFingers(hands[0]);
    // 依手指數量 (1-5) 切換耳環
    if (fingerCount >= 1 && fingerCount <= 5) {
      currentEarringIndex = fingerCount - 1;
    }
  }

  // --- 繪製耳垂上的耳環影像 ---
  if (faces.length > 0) {
    let face = faces[0];
    
    // 1. 繪製面具 (放在耳環之前，讓耳環蓋在上面)
    drawMask(face, vWidth, vHeight);

    // 選取臉頰兩側耳垂點：147 (右), 376 (左)
    let keypoints = [face.keypoints[147], face.keypoints[376]];

    imageMode(CENTER); 
    for (let i = 0; i < keypoints.length; i++) {
      let pt = keypoints[i];
      if (pt) {
        // 座標映射
        let mappedX = map(pt.x, 0, capture.width, 0, vWidth);
        let mappedY = map(pt.y, 0, capture.height, 0, vHeight);
        
        // 耳環大小設為影像寬度的 8%
        let eSize = vWidth * 0.08;
        
        // 繪製目前的耳環圖片
        image(earringImages[currentEarringIndex], mappedX, mappedY, eSize, eSize);
      }
    }
    imageMode(CORNER); 
  }
  pop();
}

// 接收臉部偵測結果
function gotFaces(results) {
  faces = results;
}

// 接收手部偵測結果
function gotHands(results) {
  hands = results;
}

// 計算手指數量的輔助函數
function countFingers(hand) {
  let count = 0;

  // 檢查四隻手指：食指(8), 中指(12), 無名指(16), 小指(20)
  // 判斷指尖 (Tip) 是否高於指節 (Pip)
  let fingerTips = [8, 12, 16, 20];
  let fingerPips = [6, 10, 14, 18];
  for (let i = 0; i < fingerTips.length; i++) {
    if (hand.keypoints[fingerTips[i]].y < hand.keypoints[fingerPips[i]].y) {
      count++;
    }
  }

  // 拇指 (4)：判斷拇指尖與小指基部 (17) 的距離是否大於拇指第一指節 (3) 的距離
  let dTip = dist(hand.keypoints[4].x, hand.keypoints[4].y, hand.keypoints[17].x, hand.keypoints[17].y);
  let dJoint = dist(hand.keypoints[3].x, hand.keypoints[3].y, hand.keypoints[17].x, hand.keypoints[17].y);
  if (dTip > dJoint) {
    count++;
  }

  return count;
}

// 繪製面具的輔助函數
function drawMask(face, vWidth, vHeight) {
  // 選取面具中心點 (168 為鼻樑中心)
  let center = face.keypoints[168];
  // 選取臉部邊緣點以計算面具寬度 (234 為右臉邊緣, 454 為左臉邊緣)
  let leftEdge = face.keypoints[234];
  let rightEdge = face.keypoints[454];

  if (center && leftEdge && rightEdge) {
    // 座標映射
    let mx = map(center.x, 0, capture.width, 0, vWidth);
    let my = map(center.y, 0, capture.height, 0, vHeight);
    
    // 計算面具寬度：根據臉部兩側距離，稍微放大 (1.2倍) 以覆蓋臉部
    let faceDist = dist(leftEdge.x, leftEdge.y, rightEdge.x, rightEdge.y);
    let mWidth = map(faceDist, 0, capture.width, 0, vWidth) * 1.5;
    let mHeight = mWidth * (maskImages[currentEarringIndex].height / maskImages[currentEarringIndex].width);

    push();
    imageMode(CENTER);
    // 繪製對應的手勢面具
    image(maskImages[currentEarringIndex], mx, my, mWidth, mHeight);
    pop();
  }
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}