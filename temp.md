

具体的な実装について説明します。
RxJS不使用版・使用版の両方を実装し、後で両者を比較します。


### JavaScriptの構文についての補足

今回使用している構文の一部について簡単な使い方を示しておきます。

* `let`や`const`は変数宣言キーワード。`const`で宣言した変数は後で再代入できない
* `x => x * x`や`() => { /*処理*/ }`は関数定義。
* 配列クラスメソッド
    * `map`：渡した関数で変換した配列を返す。
        例）`[1,2,3].map( x => x * x )`の結果は`[1,4,9]`
    * `filter`：渡した判定関数で真となる要素のみからなる配列を返す。
        例）`[1,2,3,4,5].filter( x => x % 2 === 1 )`の結果は`[1,3,5]`
    * `every`：配列の全要素が条件を満たすか判定する。
        例）`[1,3,5,7].every( x => x % 2 === 1 )`の結果は`true`
    * `slice`：配列の切り出し。
        例）`[1,2,3,4,5].slice(1,3)`の結果は`[2,3]`、
            `[1,2,3,4,5].slice(2,4)`の結果は`[3,4]`
    * `join`：配列の文字列化。
        例）`[2018,7,27].join('-')`の結果は`"2018-7-27"`
* 文字列クラスメソッド
    * `split`：文字列の分割と配列化。
        例）`"aaa,bbb,ccc".split(',')`の結果は`["aaa","bbb","ccc"]`
    * `replace`：正規表現に最初にマッチする部分を置換。
        例）`"aaabbb".replace(/aa/,'cc')`の結果は`"ccabbb"`
    * `indexOf`：部分文字列が最初に現れるインデックスを返す。存在しなければ`-1`を返す。
        例）`abcdef.indexOf('cd')`の結果は`2`、
            `abcdef.indexOf('g')`の結果は`-1`。
* その他
    * `setTimeout`・`clearTimeout`：処理を予約・解除する
        例）`const timerId = setTimeout( alert('aaa'), 3000 )`とすると'aaa'というメッセージのアラートが3秒後に表示される．
        その後3秒以内に`clearTimeout(timerId)`とすると，このアラート表示処理の予約を解除する．
    * `Math.ceil`：天井関数。整数に切り上げた値を返す。
        例）`Math.ceil(2.4)`は`3`


### 構成

サンプルアプリケーションは以下のファイルからなります。

* index.html
* styles.css
* js
    * common.js （共通定義）
    * tableApp.js （RxJS不使用版）
    * tableApp_rxjs.js （RxJS版）


### 共通定義

RxJS不使用版・RxJS使用版で共用するindex.htmlとcommon.jsの中身を説明します。


#### index.html

説明に必要な部分のみ載せます。`mdl-***`というクラスはデザインを指定しているだけなのでロジックには関係ありません。

```html
...

    <!-- 1ページあたりの表示行数とページの指定 -->
    <div class="pager">
      <div class="margined-element items-per-page-wrapper">
        Items per page (1-1000) : 
        <div class="mdl-textfield mdl-js-textfield">
          <input class="mdl-textfield__input" id="items-per-page"
            type="number" min="1" max="1000" value="50">
          <label class="mdl-textfield__label" for="items-per-page">
            items per page
          </label>
        </div>
      </div>
      <div class="margined-element current-page-wrapper">
        Page at (1-<span id="page-length">1</span>): 
        <div class="mdl-textfield mdl-js-textfield">
          <input class="mdl-textfield__input" id="current-page"
            type="number" min="1" max="100" value="1">
          <label class="mdl-textfield__label" for="current-page">
            page
          </label>
        </div>
      </div>
    </div>

    <div class="margined-element">
      <span id="range"></span>
    </div>

    <!-- テーブル部分 -->
    <table id="data-table"
        class='data-table shadow3px vertical-line'>
      <thead>
        <tr>
          <th>No.</th>
          <th>FullName</th>
          <th>Email Address</th>
          <th>Gender</th>
        </tr>
      </thead>
      <tbody>
        <!-- jsで書き換え -->
      </tbody>
    </table>

...
```

#### common.js

RxJS不使用版・RxJS使用版で共用する定数や関数を定義します。

* 表データCSVファイルのURL

```js
const url = 'https://dl.dropboxusercontent.com/s/d76vdmr3jafwg3j/testdata.csv';
```

* テーブルを表示

```js
const printTable = ( tableData ) => {
  const htmlStr = tableData.map( line =>
          '<tr>' + line.map( item => `<td>${item}</td>` ).join('') + '</tr>' )
        .join('\n');

  const $table = document.getElementById('data-table');  // テーブル要素を取得
  const $tbody = $table.getElementsByTagName('tbody')[0];  // tbody部分を取り出す
  $tbody.innerHTML = htmlStr;  // htmlを書き換え
};
```

* csv文字列から2次元テーブルを作成

```js
const CSVtoTable = ( csvText ) =>
    csvText.replace(/\n+$/g, '')  // 末尾の改行は削除
          .split('\n')  // => 改行ごとに分割
          .map( line => line.split(',') );  // カンマで分割
```

* テーブルデータと1ページあたりの表示行数からページ数を計算

```js
const getPageLength = (tableLength, itemsPerPage) =>
  Math.ceil( tableLength / itemsPerPage );  // 端数切り上げ
```

* 1ページ表示行数とページ番号を受け取ってテーブルの現在のページ部分の範囲のインデックスを計算し、
    その範囲を表すオブジェクト { begin: Number, end: Number } を返す。

```js
const getRange = (itemsPerPage, currentPage) => ({
  begin: itemsPerPage * (currentPage - 1),
  end:   itemsPerPage * currentPage
});
```



### RxJSを使わない実装

RxJSを使わない普通のJavaScriptだけの実装例を以下に示します。

---

まず、各データに対応する変数を宣言します。

```js
let itemsPerPage = 50;  // 1ページに表示する列数
let currentPage = 1;    // 現在のページ番号
let pageLength = 0;     // ページ数

let table = [];         // テーブルデータ
let tableSliced = [];   // tableの現在のページ部分
```

---

データの更新処理を行う関数を2つ定義します。

```js

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
```

---

CSVファイル取得時の処理を登録します。
CSVファイルのダウンロードが完了したら`event => {...}`が実行されます。
（httpリクエスト送信部分の詳細は分からなければ読み飛ばしてください）

```js
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
```

1ページあたりの表示行数を指定するテキストボックスの入力時の処理を登録します。
テキストボックスに入力があるたびに`event => {...}`が実行されます。
間引き処理のためにだいぶ読みづらくなっていますが、やっていることは間引き処理です。
テキストボックス入力があると、
`clearTimeout`により前回予約した処理をキャンセルし、
`setTimeout`により300ミリ秒後に処理を予約しなおす、
ということが行われるので、300ミリ秒入力が止んだときに初めて
`itemsPerPage`の更新・`updatePageLength()`・`updateSlicedTable()`が実行される、
という仕組みになっています。

```js
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
```

---

同様に、現在のページを指定するテキストボックスの入力時の処理を登録します。

```js
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
```



### RxJSの導入


#### RxJSの手軽な導入方法

1. index.html に以下の1行を追加

```html
<script src="https://unpkg.com/rxjs/bundles/rxjs.umd.min.js"></script>
```

2. JavaScriptのソースコード内で必要なものをimportする

```js
const { Observable, fromEvent, combineLatest, merge } = rxjs;
const { map, startWith, debounceTime, withLatestFrom } = rxjs.operators;
```


### RxJSを使った実装






## RxJS使用するメリット

今回実装したアプリケーションについて
RxJSを使用した場合とそうでない場合を比較すると、
RxJSについて以下のようなメリットが挙げられます。

* グローバル変数への再代入が無い
    * ［RxJS不使用］再代入可能なグローバル変数を使っているのでその値が予測しづらい。
    * ［RxJS使用］RxJSではObservableでデータを表すので、
        その値の定義は変数の宣言＆定義部分で完結している。変数の値が予測しやすい。
* 変数とそれに対する処理の依存関係の記述が楽
    * ［RxJS不使用］ある変数の値が書き換わるとき、
        同時に書き換えなければならない変数やその書き換え実行順序を
        逐一すべて把握していなければならない。
    * ［RxJS使用］変数はそもそも依存している別のObservableやイベントにより定義された
        Observableなので、先の問題は起こらない。
        依存している変数の値の更新は自動的に芋づる式に行われるので、
        処理の依存関係・実行順序の心配がほとんど無い。
* ロジックと表示処理の記述を分離できる
    * ［RxJS不使用］変数の更新と表示処理を同時に行うためにそこにまとめて記述する必要があり、
        ソースコードが整理しづらい。
        表示処理がJavaScriptソースコード全体に散らばっているため、
        HTMLソースコードを変えた時の修正が大変。
    * ［RxJS使用］表示処理部分がまとまって記述されるので、
        読みやすくなる＆HTMLソースコード変更時のJavaScriptソースコードの修正が楽
* パイプ処理を使って直感的にデータの加工が行える
    *  RxJS不使用］300ms以内の連続入力による
    sliceの複数回実行を抑制する処理（`setTimeout`や`clearTimeout`を使った部分）
    がとても読みづらいコードになっていた
    * ［RxJS使用］`pipe`メソッドで`decounceTime(300)`を挟むだけでよい。






## おわりに

今回はただのhtmlやJavaScriptを直接編集して実装しましたが、
規模が大きくなってくる場合は何かフレームワークを使った方が
より効率よく実装できると思います。

例えばAngularではテンプレート（htmlファイル）内でasync pipeというものを使って
テンプレート内でsubscribe処理を行うことができるため、
JavaScript部分がロジックの実装に集中できるようになります。



## 補足

* 今回のソースコードを手元で動かしてみたい場合は
    [こちら](https://dl.dropboxusercontent.com/s/2avbobjiissm378/DataTableApp_by_rxjs.zip)
    からダウンロードしてください。
    index.html末尾のJavaScriptのソースコードを読み込む部分のコメントアウトを切り替えるようになっています。



## リンク （2018/6/26時点）

* [RxJS](https://rxjs-dev.firebaseapp.com/)

* [RxJS Github](https://github.com/ReactiveX/rxjs)

* [RxJS Marbles](http://rxmarbles.com/)
    RxJSのオペレータの動作を視覚的に学べるサイト

* [Angular 日本語ドキュメンテーション](https://angular.jp/)

* [mockadoo](https://mockaroo.com/)
    CSVダミーデータの生成

* [Material Design Lite](https://getmdl.io/components/index.html#textfields-section)
    * テキストボックスのデザインに使ったライブラリ
    （index.htmlでcssとJavaScriptのソースコードを読み込むだけで使用できます）。

