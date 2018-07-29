/**
 * tableApp
 */
document.getElementById('title').innerText = 'Data table app';


let fullName = '';      // 「名前」の列のテキストフィールドの値
let emailAddress = '';  // 「Eメールアドレス」の列のテキストフィールドの値
let gender = '';        // 「性別」の列のテキストフィールドの値

let itemsPerPage = 50;  // 1ページに表示する列数
let pageNumber = 1;     // 現在のページ番号
let pageLength = 0;     // ページ数

let table = [];          // テーブルデータ
let tableFiltered = [];  // フィルタ後のテーブルデータ
let tableSliced = [];    // tableFilteredのうち現在のページの部分


// functions

const updatePageLength = () => {
  pageLength = Math.ceil( tableFiltered.length / itemsPerPage );
  pageNumber = 1;
};

const updateFilteredTable = () => {
  tableFiltered = table.filter( line => filterFn( line, fullName, emailAddress, gender ) );
  updatePageLength();
};

const updateSlicedTable = () => {
  const itemsPerPage_tmp = (itemsPerPage || 50);
  const pageNumber_tmp = (pageNumber || 1);
  tableSliced = tableFiltered.slice(
            itemsPerPage_tmp * (pageNumber_tmp - 1),
            itemsPerPage_tmp * pageNumber_tmp )
};


const printAll = () => {
  // テーブルを表示
  printTable( document.getElementById('data-table'), tableSliced );

  // フィルタ後の行数を表示
  document.getElementById('nof-items').innerText = tableFiltered.length;

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
    updateFilteredTable();
    updateSlicedTable();
    printAll();
  }); 
}

{
  let timerId;
  document.getElementById('full-name')  // full-nameの入力欄
    .addEventListener('input', event => {
      clearTimeout(timerId);
      timerId = setTimeout( () => {
        fullName = event.target.value;
        updateFilteredTable();
        updateSlicedTable();
        printAll();
      }, 300 );
  });
}
{
  let timerId;
  document.getElementById('email-address')  // emailの入力欄
    .addEventListener('input', event => {
      clearTimeout(timerId);
      timerId = setTimeout( () => {
        emailAddress = event.target.value;
        updateFilteredTable();
        updateSlicedTable();
        printAll();
      }, 300 );
  });
}
{
  let timerId;
  document.getElementById('gender')  // genderの入力欄
    .addEventListener('input', event => {
      clearTimeout(timerId);
      timerId = setTimeout( () => {
        gender = event.target.value;
        updateFilteredTable();
        updateSlicedTable();
        printAll();
      }, 300 );
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
