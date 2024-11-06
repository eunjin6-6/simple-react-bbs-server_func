const cors = require('cors');
const express = require('express');
const app = express();
const port = 8000;
const multer  = require('multer');


//본문을 통해서 넘어온 요청 파싱(=변환)하기 위해 설치한 미들웨어 (body-parser)를 이용
app.use(express.json()); //jason 형식으로 변환 //{"name":"Alice", "age":"25"}
app.use(express.urlencoded()); //json -> object로 변환 {name:"Alice", age: '29'}

var corsOptions = {
  //origin: 'http://localhost:3000',
  origin: '*' //모든 출처 허용
  //optionsSuccessStatus: 200 // some legacy browsers (IE11, various SmartTVs) choke on 204
}

app.use(cors(corsOptions));


const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/')
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 5)
    cb(null, uniqueSuffix + file.originalname)
  }
})

const upload = multer({ storage: storage })




const mysql = require('mysql');
const db = mysql.createConnection({
  host     : 'localhost',
  user     : 'react_bbs',
  password : '1234',
  database: 'react_bbs'
});

db.connect();


app.get('/', (req, res) => {

  const sql = "INSERT INTO requested (rowno) VALUES (1)";
  
  db.query(sql, function(err, rows, fields) {
    if (err) throw err;
    res.send('성공')
    console.log('데이터 추가 성공');
  });

})


app.get('/list', (req, res) => {
  const sql = "SELECT BOARD_ID, BOARD_TITLE, BOARD_CONTENT, REGISTER_ID, DATE_FORMAT(REGISTER_DATE, '%Y-%m-%d') AS REGISTER_DATE FROM board";
  db.query(sql, (err, result)=>{
    if (err) throw err;
    res.send(result);
  });
})

// /detail 주소로 요청이 들어오면 할 일
app.get('/detail', (req, res) => {
  const id = req.query.id;  //get방식으로 id 에 넘어온 숫자 받아오는 방법
  const sql = "SELECT BOARD_TITLE, BOARD_CONTENT FROM board WHERE BOARD_ID = ?";
  db.query(sql, [id], (err, result)=>{
    if (err) throw err;
    res.send(result);
  });
})


app.post('/insert', upload.single('image'), (req, res) => {
  //console.log(req.body.title); //post 방식이라 body 안에 숨어서옴
  let title = req.body.title;
  let content = req.body.content;
  let imagePath = req.file ? req.file.path : null; //필수값은 아니라서

  const sql = "INSERT INTO board (BOARD_TITLE, BOARD_CONTENT, IMAGE_PATH, REGISTER_ID) VALUES (?, ?, ?, 'admin')"; //보안상 아래 작성, 노출될 위험 있는 문장
  db.query(sql, [title, content, imagePath], (err, result) => {
    if (err) throw err;
    res.send(result);
  });
})


app.post('/update', (req, res) => {
  // let title = req.body.title;
  // let content = req.body.content;
  // let id = req.body.id;
  const {id, title, content} = req.body; //비구조할당 이용
  
  const sql = "UPDATE board SET BOARD_TITLE=?, BOARD_CONTENT=? WHERE BOARD_ID=?";
  db.query(sql, [title, content, id], (err, result) => {
    if (err) throw err;
    res.send(result);
  });
})


app.post('/delete', (req, res) => {
  //const boardIdList = req.body.boardIdList;
  const {boardIdList} = req.body; //비구조할당 이용
  
  const sql = `DELETE FROM board WHERE BOARD_ID in (${boardIdList})`;
  //console.log(sql); 콘솔에서 확인
  db.query(sql, (err, result) => {
    if (err) throw err;
    res.send(result);
  });
})



app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})




//db.end();