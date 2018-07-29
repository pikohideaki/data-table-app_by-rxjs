/**
 * tableApp
 */
document.getElementById('title').innerText = 'Data table app';


let itemsPerPage = 50;  // 1ページに表示する列数
let pageNumber = 1;     // 現在のページ番号
let pageLength = 0;     // ページ数

let table = [];          // テーブルデータ
let tableSliced = [];    // tableの現在のページ部分


// functions

// DOMにテーブルデータを表示
const printTable = ( $table, tableData ) => {
  const $tbody = $table.getElementsByTagName('tbody')[0];
  $tbody.innerHTML
    = tableData.map( line =>
          '<tr>' + line.map( item => `<td>${item}</td>` ).join('') + '</tr>' )
        .join('\n');
};

// CSVデータをtableに変換
const CSVtoTable = ( csvText ) =>
    csvText.replace(/\n+$/g, '')  // 末尾の改行は削除
          .split('\n')  // => 改行ごとに分割
          .map( line => line.split(',') );  // カンマで分割

const updatePageLength = () => {
  pageLength = Math.ceil( table.length / itemsPerPage );
  pageNumber = 1;
};

const updateSlicedTable = () => {
  const itemsPerPage_tmp = (itemsPerPage || 50);
  const pageNumber_tmp = (pageNumber || 1);
  const rangeBegin = itemsPerPage_tmp * (pageNumber_tmp - 1);
  const rangeEnd = itemsPerPage_tmp * pageNumber_tmp;
  document.getElementById('range').innerText = `(${rangeBegin + 1}-${rangeEnd})`
  tableSliced = table.slice( rangeBegin, rangeEnd );
};


const printAll = () => {
  // テーブルを表示
  printTable( document.getElementById('data-table'), tableSliced );

  // フィルタ後の行数を表示
  document.getElementById('nof-items').innerText = table.length;

  // ページ数を表示
  document.getElementById('page-length').innerText = (pageLength || 1);
  document.getElementById('page-number').setAttribute('max', pageLength);

  // 1ページあたりの表示行数を指定するテキストボックスの値を更新
  document.getElementById('items-per-page').value = (itemsPerPage || 50);

  // ページ番号を指定するテキストボックスの値を更新
  document.getElementById('page-number').value = (pageNumber || 1);
};



///// event listeners
{
  const req = new XMLHttpRequest();
  const url = 'https://dl.dropboxusercontent.com/s/d76vdmr3jafwg3j/testdata.csv';
  req.open('get', url);  // リクエストを初期化
  req.send();  // リクエストの送信
  req.addEventListener('load', event => {
    const csvString = event.target.responseText;
    table = CSVtoTable( csvString );
    updatePageLength();
    updateSlicedTable();
    printAll();
  }); 
}

{
  let timerId;
  document.getElementById('items-per-page')  // items-per-pageの入力欄
    .addEventListener('input', event => {
      clearTimeout(timerId);
      timerId = setTimeout( () => {
        itemsPerPage = event.target.valueAsNumber;
        updatePageLength();
        updateSlicedTable();
        printAll();
      }, 300 );
  });
}
{
  let timerId;
  document.getElementById('page-number')  // page-numberの入力欄
    .addEventListener('input', event => {
      clearTimeout(timerId);
      timerId = setTimeout( () => {
        pageNumber = event.target.valueAsNumber;
        updateSlicedTable();
        printAll();
      }, 300 );
  });
}


// printAll();

// 初期化

// // 1ページあたりの表示行数を指定するテキストボックスの値を更新
// document.getElementById('items-per-page').value = 50;

// // ページ番号を指定するテキストボックスの値を更新
// document.getElementById('page-number').value = 1;
