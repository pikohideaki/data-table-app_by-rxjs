
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

// 部分文字列一致判定
const submatch = ( target, key ) => ( (target || '').indexOf( key ) !== -1 );

// 文字列配列strArrayが各クエリ文字列queriesを含むか判定
const filterFn = (strArray, ...queries) =>
    queries.every( (query, i) => submatch( strArray[i], query ) );
