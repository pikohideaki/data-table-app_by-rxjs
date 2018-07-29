# RxJSの紹介

## RxJSとは

* **R**eactive E**x**tension for **J**ava**S**cript  
  リアクティブプログラミング用のJavaScriptのライブラリ


## 対象読者

* JavaScriptは
* リアクティブプログラミングは知らない


## RxJSの手軽な導入方法

1. index.html に以下の1行を追加

```html
<script src="https://unpkg.com/rxjs/bundles/rxjs.umd.min.js"></script>
```

2. JavaScriptのソースコード内で以下のように必要なものをimportする

```js
const { Observable, fromEvent, combineLatest, merge } = rxjs;
const { map, startWith, debounceTime, withLatestFrom } = rxjs.operators;
```


## 目標

* RxJSを利用する利点を説明すること
    * 相互依存性の低いプログラムになる
        * 依存関係が複雑な処理を明快に実装できる
        * 複数のイベントを含む非同期処理を扱うとき有用
        * 何段階かの工程
        * 依存している変数の値の更新を芋づる式に行わせることで記述量を減らす
    * データの加工が直感的に行える
        * 素朴な実装だと複雑で直感的でない処理も、RxJSを使えばオペレータ一つで行えるケースも
* jsの基本的な構文だけしか知らない人向け
* RxJSの各クラスや関数自体の具体的な実装には触れず、ブラックボックスとする




```js
const req = new XMLHttpRequest();
const url = 'https://dl.dropboxusercontent.com/s/d76vdmr3jafwg3j/testdata.csv';
req.open('get', url);  // リクエストを初期化
req.send();  // リクエストの送信
const csvText$ = fromEvent( req, 'load' )  // 'load'イベントからObservableを作成
                    .pipe( map( event => event.target.responseText ),
                           startWith('') );
```

CSVファイルの中身

```txt
Helaina Cunnell,hcunnell0@va.gov,Female
Wenda Teacy,wteacy1@4shared.com,Female
Fidelia Clayworth,fclayworth2@biblegateway.com,Female
Carlynne Duesbury,cduesbury3@nba.com,Female
Burton Bricknall,bbricknall4@altervista.org,Male

...

```

データテーブルの仕様

* テーブルデータはCSVファイル 'https://dl.dropboxusercontent.com/s/d76vdmr3jafwg3j/testdata.csv' をhttpリクエストで取得したものとする
    * 内容は「名前」「Eメールアドレス」「性別」の3列からなるテーブルデータ
* リアルタイムフィルタリング機能：
    「名前」「Eメールアドレス」「性別」の各列に対し、リアルタイムなフィルタリングができる（各列の一番上の行のテキストボックスに文字列を入力すると、即座にその文字列を含む行のみに絞って表示する）
* ページネーション機能：
    * ページ番号を指定すると該当する範囲のデータのみ表示する
    * 1ページあたりの表示行数を指定できる（デフォルトは50行）
* その他
    * フィルタや表示行数変更により全ページ数が変わったときには選択ページ番号を1にリセットする
    （例えば1ページ100行表示・8ページ目を選択中に
    1ページ100行表示→200行表示と変更すると、
    全ページ数は5となり
    選択ページ番号が8のままだと存在しないページを選択したままになってしまう）


## JavaScriptの構文についての補足

今回使用している構文の一部について簡単な使い方を示します。

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
    * `replace`：正規表現にマッチする部分を置換。
        例）`"aaabbb".replace(/ab/,'cc')`の結果は`"aaccbb"`
    * `indexOf`：部分文字列が最初に現れるインデックスを返す。存在しなければ`-1`を返す。
        例）`abcdef.indexOf('c')`の結果は`2`、
            `abcdef.indexOf('g')`の結果は`-1`。

* その他
    * `setTimeout`・`clearTimeout`：処理を予約・解除する
        例）`const timerId = setTimeout( alert('aaa'), 3000 )`とすると'aaa'というメッセージのアラートが3秒後に表示される．
        その後3秒以内に`clearTimeout(timerId)`とすると，このアラート表示処理の予約を解除する．
    * `Math.ceil`：天井関数。整数に切り上げた値を返す。
        例）`Math.ceil(2.4)`は`3`
