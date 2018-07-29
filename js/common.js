
const url = 'https://dl.dropboxusercontent.com/s/d76vdmr3jafwg3j/testdata.csv';

// テーブルを表示
const printTable = ( $table, tableData ) => {
  const $tbody = $table.getElementsByTagName('tbody')[0];
  $tbody.innerHTML
    = tableData.map( line =>
          '<tr>' + line.map( item => `<td>${item}</td>` ).join('') + '</tr>' )
        .join('\n');
};

// csv文字列を2次元テーブルに変換
const CSVtoTable = ( csvText ) =>
    csvText.replace(/\n+$/g, '')  // 末尾の改行は削除
          .split('\n')  // => 改行ごとに分割
          .map( line => line.split(',') );  // カンマで分割

const getPageLength = (table, itemsPerPage) =>
  Math.ceil( table.length / itemsPerPage );  // 端数切り上げ

// 現在のページの範囲を表すオブジェクト { begin: Number, end: Number } を返す
const getRange = (itemsPerPage, pageNumber) => ({
  begin: itemsPerPage * (pageNumber - 1),
  end:   itemsPerPage * pageNumber
});

