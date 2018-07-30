
// 表データCSVファイルのURL
const url = 'https://dl.dropboxusercontent.com/s/d76vdmr3jafwg3j/testdata.csv';

// テーブルを表示
const printTable = ( tableData ) => {
  const htmlStr = tableData.map( line =>
          '<tr>' + line.map( item => `<td>${item}</td>` ).join('') + '</tr>' )
        .join('\n');

  const $table = document.getElementById('data-table');  // テーブル要素を取得
  const $tbody = $table.getElementsByTagName('tbody')[0];  // tbody部分を取り出す
  $tbody.innerHTML = htmlStr;  // htmlを書き換え
};

// csv文字列から2次元テーブルを作成
const CSVtoTable = ( csvText ) =>
    csvText.replace(/\n+$/g, '')  // 末尾の改行は削除
          .split('\n')  // => 改行ごとに分割
          .map( line => line.split(',') );  // カンマで分割

// テーブルデータと1ページあたりの表示行数からページ数を計算
const getPageLength = (tableLength, itemsPerPage) =>
  Math.ceil( tableLength / itemsPerPage );  // 端数切り上げ

// 1ページ表示行数とページ番号を受け取ってテーブルの現在のページ部分の範囲のインデックスを計算し、
// その範囲を表すオブジェクト { begin: Number, end: Number } を返す。
const getRange = (itemsPerPage, currentPage) => ({
  begin: itemsPerPage * (currentPage - 1),
  end:   itemsPerPage * currentPage
});

