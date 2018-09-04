/**
 * tableApp
 */
document.getElementById('title').innerText = 'Data table app';


let fullName = '';      // 「名前」の列のテキストフィールドの値
let emailAddress = '';  // 「Eメールアドレス」の列のテキストフィールドの値
let gender = '';        // 「性別」の列のテキストフィールドの値

let itemsPerPage = 50;  // 1ページに表示する列数
let currentPage = 1;    // ページ番号
let pageLength = 0;     // ページ数

let table = [];         // テーブルデータ
let tableFiltered = []; // フィルタ後のテーブルデータ
let tableSliced = [];   // tableの表示するページ部分


// pageLengthの更新
const updatePageLength = () => {
  pageLength = getPageLength( tableFiltered.length, itemsPerPage ); // 端数切り上げ
  currentPage = 1;  // リセット

  // 表示処理
  $pageLength.innerText = pageLength;
  $currentPage.setAttribute('max', pageLength );
  $currentPage.value = currentPage;
};


// tableFilteredの更新
const updateTableFiltered = () => {
  tableFiltered = table.filter( line => filterFn( line, fullName, emailAddress, gender ) );
  updatePageLength();
};


// tableSlicedの更新
const updateAndPrintTableSliced = () => {
  const range = getRange( itemsPerPage, currentPage );

  tableSliced = tableFiltered.slice( range.begin, range.end );  // 更新

  // 表示処理
  $range.innerText
    = `(${range.begin + 1}-${range.end}) of ${tableFiltered.length} items`;

  printTable( tableSliced );
};



///// event listeners
{
  // full-nameの入力欄に入力があったときの処理
  let timerId;
  $fullName.addEventListener('input', event => {
    clearTimeout(timerId);
    timerId = setTimeout( () => {
      fullName = (event.target.value || '');
      updateTableFiltered();
      updateAndPrintTableSliced();
    }, 300 );
  });
}
{
  // emailの入力欄に入力があったときの処理
  let timerId;
  $emailAddress.addEventListener('input', event => {
    clearTimeout(timerId);
    timerId = setTimeout( () => {
      emailAddress = (event.target.value || '');
      updateTableFiltered();
      updateAndPrintTableSliced();
    }, 300 );
  });
}
{
  // genderの入力欄に入力があったときの処理
  let timerId;
  $gender.addEventListener('input', event => {
    clearTimeout(timerId);
    timerId = setTimeout( () => {
      gender = (event.target.value || '');
      updateTableFiltered();
      updateAndPrintTableSliced();
    }, 300 );
  });
}
{
  // CSVテキストの取得と取得完了時の処理
  const req = new XMLHttpRequest();
  req.open('get', url);  // リクエストを初期化
  req.send();  // リクエストの送信
  req.addEventListener('load', event => {
    const csvString = (event.target.responseText || '');  // 取得したデータからのcsvTextの取り出し
    table = CSVtoTable( csvString );
    updateTableFiltered();
    updateAndPrintTableSliced();
  }); 
}

{
  // items-per-pageの入力欄に入力があったときの処理
  let timerId;
  $itemsPerPage.addEventListener('input', event => {
    clearTimeout(timerId);  // 前回の予約をキャンセル
    timerId = setTimeout( () => {  // 処理を予約し予約番号をtimerIdに控える
      itemsPerPage = (event.target.valueAsNumber || 50);  // テキストボックス内の値を数値として取出す
      updatePageLength();
      updateAndPrintTableSliced();
    }, 300 );
  });
}
{
  // current-pageの入力欄に入力があったときの処理
  let timerId;
  $currentPage.addEventListener('input', event => {
      clearTimeout(timerId);  // 前回の予約をキャンセル
      timerId = setTimeout( () => {  // 処理を予約し予約番号をtimerIdに控える
        currentPage = (event.target.valueAsNumber || 1);  // テキストボックス内の値を数値として取出す
        updateAndPrintTableSliced();
      }, 300 );
  });
}
