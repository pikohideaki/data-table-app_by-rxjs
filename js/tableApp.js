/**
 * tableApp
 */
document.getElementById('title').innerText = 'Data table app';


let itemsPerPage = 50;  // 1ページに表示する列数
let pageNumber = 1;     // 現在のページ番号
let pageLength = 0;     // ページ数

let table = [];         // テーブルデータ
let tableSliced = [];   // tableの現在のページ部分


// functions

const updatePageLength = () => {
  pageLength = getPageLength(table, itemsPerPage); // 端数切り上げ
  pageNumber = 1;  // リセット

  // 表示処理
  document.getElementById('page-length').innerText = (pageLength || 0);
  document.getElementById('page-number').setAttribute('max', (pageLength || 1) );

  document.getElementById('page-number').value = (pageNumber || 1);
};

const updateSlicedTable = () => {
  const range = getRange( (itemsPerPage || 50), (pageNumber || 1) );

  tableSliced = table.slice( range.begin, range.end );  // 更新

  // 表示処理
  document.getElementById('range').innerText
    = `(${range.begin + 1}-${range.end}) of ${table.length} items`;

  printTable( document.getElementById('data-table'), tableSliced );
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
      clearTimeout(timerId);
      timerId = setTimeout( () => {
        itemsPerPage = event.target.valueAsNumber;  // テキストボックス内の値を数値として取出す
        updatePageLength();
        updateSlicedTable();
      }, 300 );
  });
}
{
  let timerId;
  document.getElementById('page-number')  // page-numberの入力欄
    .addEventListener('input', event => {
      clearTimeout(timerId);
      timerId = setTimeout( () => {
        pageNumber = event.target.valueAsNumber;  // テキストボックス内の値を数値として取出す
        updateSlicedTable();
      }, 300 );
  });
}
