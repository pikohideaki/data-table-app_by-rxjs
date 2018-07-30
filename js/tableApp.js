/**
 * tableApp
 */
document.getElementById('title').innerText = 'Data table app';


let itemsPerPage = 50;  // 1ページに表示する列数
let currentPage = 1;    // ページ番号
let pageLength = 0;     // ページ数

let table = [];         // テーブルデータ
let tableSliced = [];   // tableの表示するページ部分


// functions

// pageLengthの更新
const updatePageLength = () => {
  pageLength = getPageLength( table.length, itemsPerPage ); // 端数切り上げ
  currentPage = 1;  // リセット

  // 表示処理
  document.getElementById('page-length').innerText = (pageLength || 0);
  document.getElementById('current-page').setAttribute('max', (pageLength || 1) );

  document.getElementById('current-page').value = (currentPage || 1);
};

// tableSlicedの更新
const updateSlicedTable = () => {
  const range = getRange( (itemsPerPage || 50), (currentPage || 1) );

  tableSliced = table.slice( range.begin, range.end );  // 更新

  // 表示処理
  document.getElementById('range').innerText
    = `(${range.begin + 1}-${range.end}) of ${table.length} items`;

  printTable( tableSliced );
};



///// event listeners
{
  const req = new XMLHttpRequest();
  req.open('get', url);  // リクエストを初期化
  req.send();  // リクエストの送信
  req.addEventListener('load', event => {
    const csvString = event.target.responseText;  // 取得したデータからのcsvTextの取り出し
    table = CSVtoTable( csvString );
    updatePageLength();
    updateSlicedTable();
  }); 
}

{
  let timerId;
  document.getElementById('items-per-page')  // items-per-pageの入力欄
    .addEventListener('input', event => {
      clearTimeout(timerId);  // 前回の予約をキャンセル
      timerId = setTimeout( () => {  // 処理を予約し予約番号をtimerIdに控える
        itemsPerPage = event.target.valueAsNumber;  // テキストボックス内の値を数値として取出す
        updatePageLength();
        updateSlicedTable();
      }, 300 );
  });
}
{
  let timerId;
  document.getElementById('current-page')  // current-pageの入力欄
    .addEventListener('input', event => {
      clearTimeout(timerId);  // 前回の予約をキャンセル
      timerId = setTimeout( () => {  // 処理を予約し予約番号をtimerIdに控える
        currentPage = event.target.valueAsNumber;  // テキストボックス内の値を数値として取出す
        updateSlicedTable();
      }, 300 );
  });
}
