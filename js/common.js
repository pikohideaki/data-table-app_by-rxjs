
// 表データCSVファイルのURL
const url = 'https://dl.dropboxusercontent.com/s/d76vdmr3jafwg3j/testdata.csv';


// documentの要素

const $tbody = document.getElementById('data-table')  // テーブル要素
                       .getElementsByTagName('tbody')[0];  // tbody部分を取り出す

const $itemsPerPage = document.getElementById('items-per-page');
const $pageLength   = document.getElementById('page-length');
const $currentPage  = document.getElementById('current-page');
const $range        = document.getElementById('range');

const $fullName     = document.getElementById('full-name');
const $emailAddress = document.getElementById('email-address');
const $gender       = document.getElementById('gender');



// テーブルを表示
const printTable = ( tableData ) => {
  const htmlStr = tableData.map( line =>
          '<tr>' + line.map( item => `<td>${item}</td>` ).join('') + '</tr>' )
        .join('\n');

  $tbody.innerHTML = htmlStr;  // htmlを書き換え
};

// csv文字列から2次元テーブルを作成
const CSVtoTable = ( csvText ) =>
    csvText.replace(/\n+$/g, '')  // 末尾の改行は削除
          .split('\n')  // => 改行ごとに分割
          .map( line => line.split(',') );  // カンマで分割

// 部分文字列一致判定
const submatch = ( target, key ) => ( (target || '').indexOf( key ) !== -1 );

// その行が各クエリ文字列を含むか判定
const filterFn = (line, fullName, emailAddress, gender) =>
    submatch( line[1], fullName )
     && submatch( line[2], emailAddress )
     && submatch( line[3], gender );

// テーブルデータと1ページあたりの表示行数からページ数を計算
const getPageLength = (tableLength, itemsPerPage) =>
  Math.ceil( tableLength / itemsPerPage );  // 端数切り上げ

// 1ページ表示行数とページ番号を受け取ってテーブルの現在のページ部分の範囲のインデックスを計算し、
// その範囲を表すオブジェクト { begin: Number, end: Number } を返す。
const getRange = (itemsPerPage, currentPage) => ({
  begin: itemsPerPage * (currentPage - 1),
  end:   itemsPerPage * currentPage
});

